-- 00022_currency_fixes.sql
-- Currency tracking fixes:
--   1. Calendar-month windows now align to first-of-month (FAA convention)
--      instead of date arithmetic. "Preceding 6 calendar months" on Apr 27
--      becomes Oct 1 (start of 6th preceding month) through today, not Oct 27.
--   2. Sum-based critical-flight calculation improved for "days remaining"
--      so events spread across multiple flights drop currency at the right
--      flight (not just the earliest).
--   3. FAA Day Passenger Currency switched from `landings` (day+night sum)
--      to `day_landings` only — night landings should not satisfy day
--      currency.
--   4. Citation infrastructure: regulation_citation + regulation_url + notes
--      columns on currency_rules so the UI can show the actual source.
--   5. Made-up military rules from the original seed are deactivated
--      (is_active = false) pending replacement with verified rules from the
--      user's actual unit publications. Existing user data is preserved;
--      they can be re-enabled or edited later.

-- ---------------------------------------------------------------------------
-- 1. Schema: citation columns
-- ---------------------------------------------------------------------------

ALTER TABLE currency_rules
  ADD COLUMN IF NOT EXISTS regulation_citation TEXT,
  ADD COLUMN IF NOT EXISTS regulation_url      TEXT,
  ADD COLUMN IF NOT EXISTS notes               TEXT;

-- ---------------------------------------------------------------------------
-- 2. Replace compute_user_currencies with corrected window math.
-- ---------------------------------------------------------------------------

-- Drop first because we are adding new return columns.
DROP FUNCTION IF EXISTS compute_user_currencies(UUID);

CREATE OR REPLACE FUNCTION compute_user_currencies(p_user_id UUID)
RETURNS TABLE (
  rule_id UUID,
  rule_name TEXT,
  required_event TEXT,
  required_count DECIMAL,
  achieved_count DECIMAL,
  period_start DATE,
  period_end DATE,
  status TEXT,
  days_remaining INTEGER,
  is_faa BOOLEAN,
  branch military_branch,
  regulation_citation TEXT,
  regulation_url TEXT,
  notes TEXT
) AS $$
DECLARE
  v_user_branch military_branch;
  v_rule RECORD;
  v_override RECORD;
  v_period_start DATE;
  v_period_end DATE;
  v_achieved DECIMAL;
  v_required DECIMAL;
  v_period_val INTEGER;
  v_period_u period_unit;
  v_warning_days INTEGER;
  v_oldest_qualifying DATE;
  v_days_rem INTEGER;
  v_status TEXT;
BEGIN
  SELECT p.branch INTO v_user_branch
  FROM profiles p
  WHERE p.id = p_user_id;

  FOR v_rule IN
    SELECT cr.*
    FROM currency_rules cr
    WHERE cr.is_active = true
      AND (cr.branch IS NULL OR cr.branch = v_user_branch)
      AND (
        cr.aircraft_type_id IS NULL
        OR cr.aircraft_type_id IN (
          SELECT ua.aircraft_type_id
          FROM user_aircraft ua
          WHERE ua.user_id = p_user_id
        )
      )
    ORDER BY cr.sort_order, cr.name
  LOOP
    SELECT uco.*
    INTO v_override
    FROM user_currency_overrides uco
    WHERE uco.user_id = p_user_id
      AND uco.currency_rule_id = v_rule.id;

    IF v_override IS NOT NULL AND v_override.is_disabled = true THEN
      CONTINUE;
    END IF;

    IF v_override IS NOT NULL
       AND v_override.waiver_expiry IS NOT NULL
       AND v_override.waiver_expiry >= CURRENT_DATE THEN
      rule_id := v_rule.id;
      rule_name := v_rule.name;
      required_event := v_rule.required_event;
      required_count := COALESCE(v_override.custom_required_count, v_rule.required_count);
      achieved_count := 0;
      period_start := CURRENT_DATE;
      period_end := v_override.waiver_expiry;
      status := 'current';
      days_remaining := (v_override.waiver_expiry - CURRENT_DATE);
      is_faa := v_rule.is_faa;
      branch := v_rule.branch;
      regulation_citation := v_rule.regulation_citation;
      regulation_url := v_rule.regulation_url;
      notes := v_rule.notes;
      RETURN NEXT;
      CONTINUE;
    END IF;

    v_required := COALESCE(v_override.custom_required_count, v_rule.required_count);
    v_period_val := COALESCE(v_override.custom_period_value, v_rule.period_value);
    v_period_u := COALESCE(v_override.custom_period_unit, v_rule.period_unit);
    v_warning_days := v_rule.warning_threshold_days;

    -- Lookback window — FIXED for calendar months/years.
    -- Days: rolling N-day window ending today (start = today - N + 1, end = today).
    -- Calendar months: from the first day of (current month - N) months ago
    --   through today. e.g. on Apr 27, 6 calendar months = Oct 1 through Apr 27.
    -- Calendar years: from the first day of (current year - N) years ago.
    v_period_end := CURRENT_DATE;
    CASE v_period_u
      WHEN 'days' THEN
        v_period_start := CURRENT_DATE - ((v_period_val - 1) || ' days')::INTERVAL;
      WHEN 'calendar_months' THEN
        v_period_start := (DATE_TRUNC('month', CURRENT_DATE) - (v_period_val || ' months')::INTERVAL)::DATE;
      WHEN 'calendar_years' THEN
        v_period_start := (DATE_TRUNC('year', CURRENT_DATE) - (v_period_val || ' years')::INTERVAL)::DATE;
    END CASE;

    -- Tally events in the window
    IF v_rule.required_event = 'day_landings' THEN
      SELECT COALESCE(SUM(f.day_landings), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSIF v_rule.required_event = 'night_landings' THEN
      SELECT COALESCE(SUM(f.night_landings), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSIF v_rule.required_event = 'full_stop_night_landings' THEN
      SELECT COALESCE(SUM(LEAST(f.night_landings, f.full_stop_landings)), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND f.night_landings > 0
        AND f.full_stop_landings > 0
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSIF v_rule.required_event = 'approaches' THEN
      SELECT COALESCE(SUM(jsonb_array_length(f.approaches)), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSIF v_rule.required_event = 'sorties' THEN
      SELECT COALESCE(COUNT(*), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND f.is_simulator = false
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSIF v_rule.required_event = 'night_sorties' THEN
      SELECT COALESCE(COUNT(*), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND f.flight_condition IN ('night', 'mixed')
        AND f.is_simulator = false
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSIF v_rule.required_event = 'nvg_sorties' THEN
      SELECT COALESCE(COUNT(*), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND f.flight_condition = 'nvg'
        AND f.is_simulator = false
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSIF v_rule.required_event = 'formation_sorties' THEN
      SELECT COALESCE(COUNT(*), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND f.sortie_type = 'formation'
        AND f.is_simulator = false
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSIF v_rule.required_event = 'carrier_traps' THEN
      SELECT COALESCE(SUM(f.carrier_traps), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSIF v_rule.required_event = 'landings' THEN
      SELECT COALESCE(SUM(f.day_landings + f.night_landings), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSIF v_rule.required_event = 'flight_review' THEN
      SELECT COALESCE(COUNT(*), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND f.sortie_type IN ('check_ride', 'evaluation')
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSE
      v_achieved := 0;
    END IF;

    -- Days remaining: when does currency lapse if I don't fly anything new?
    -- Currency lapses when the (achieved - required + 1)th oldest qualifying
    -- event rolls out of the window. We approximate this from flight dates.
    IF v_achieved >= v_required THEN
      IF v_rule.required_event IN ('sorties', 'night_sorties', 'nvg_sorties', 'formation_sorties', 'flight_review') THEN
        -- Sortie counts: pick the (achieved - required + 1)th oldest qualifying flight
        SELECT f.flight_date INTO v_oldest_qualifying
        FROM flights f
        WHERE f.user_id = p_user_id
          AND f.flight_date >= v_period_start
          AND f.flight_date <= v_period_end
          AND f.is_simulator = false
          AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id)
          AND (
            (v_rule.required_event = 'sorties')
            OR (v_rule.required_event = 'night_sorties' AND f.flight_condition IN ('night', 'mixed'))
            OR (v_rule.required_event = 'nvg_sorties' AND f.flight_condition = 'nvg')
            OR (v_rule.required_event = 'formation_sorties' AND f.sortie_type = 'formation')
            OR (v_rule.required_event = 'flight_review' AND f.sortie_type IN ('check_ride', 'evaluation'))
          )
        ORDER BY f.flight_date ASC
        OFFSET (v_achieved::INTEGER - v_required::INTEGER)
        LIMIT 1;
      ELSE
        -- Sum-based events (landings, approaches, traps): use a window
        -- function to compute cumulative contribution from oldest flight
        -- onward; the critical flight is the first whose cumulative
        -- contribution reaches (achieved - required + 1) — i.e. the first
        -- flight whose roll-out drops us below threshold.
        SELECT critical.flight_date INTO v_oldest_qualifying
        FROM (
          SELECT
            f.flight_date,
            SUM(
              CASE v_rule.required_event
                WHEN 'day_landings' THEN COALESCE(f.day_landings, 0)
                WHEN 'night_landings' THEN COALESCE(f.night_landings, 0)
                WHEN 'full_stop_night_landings' THEN
                  CASE
                    WHEN f.night_landings > 0 AND f.full_stop_landings > 0
                    THEN LEAST(f.night_landings, f.full_stop_landings)
                    ELSE 0
                  END
                WHEN 'approaches' THEN jsonb_array_length(f.approaches)
                WHEN 'carrier_traps' THEN COALESCE(f.carrier_traps, 0)
                WHEN 'landings' THEN COALESCE(f.day_landings + f.night_landings, 0)
                ELSE 0
              END
            ) OVER (
              ORDER BY f.flight_date ASC, f.id ASC
              ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS cumulative
          FROM flights f
          WHERE f.user_id = p_user_id
            AND f.flight_date >= v_period_start
            AND f.flight_date <= v_period_end
            AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id)
        ) critical
        WHERE critical.cumulative >= (v_achieved - v_required + 1)
        ORDER BY critical.flight_date ASC
        LIMIT 1;
      END IF;

      IF v_oldest_qualifying IS NOT NULL THEN
        CASE v_period_u
          WHEN 'days' THEN
            v_days_rem := (v_oldest_qualifying + (v_period_val || ' days')::INTERVAL)::DATE - CURRENT_DATE;
          WHEN 'calendar_months' THEN
            -- Currency lapses on the last day of the (Nth) calendar month after
            -- the qualifying flight's month. e.g. Jan 15 + 6 cal months = Jul 31.
            v_days_rem := (
              (DATE_TRUNC('month', v_oldest_qualifying) + ((v_period_val + 1) || ' months')::INTERVAL - INTERVAL '1 day')::DATE
              - CURRENT_DATE
            );
          WHEN 'calendar_years' THEN
            v_days_rem := (
              (DATE_TRUNC('year', v_oldest_qualifying) + ((v_period_val + 1) || ' years')::INTERVAL - INTERVAL '1 day')::DATE
              - CURRENT_DATE
            );
        END CASE;
        IF v_days_rem < 0 THEN
          v_days_rem := 0;
        END IF;
      ELSE
        v_days_rem := 0;
      END IF;

      IF v_days_rem <= v_warning_days THEN
        v_status := 'expiring_soon';
      ELSE
        v_status := 'current';
      END IF;
    ELSE
      v_status := 'expired';
      v_days_rem := 0;
    END IF;

    rule_id := v_rule.id;
    rule_name := v_rule.name;
    required_event := v_rule.required_event;
    required_count := v_required;
    achieved_count := v_achieved;
    period_start := v_period_start;
    period_end := v_period_end;
    status := v_status;
    days_remaining := v_days_rem;
    is_faa := v_rule.is_faa;
    branch := v_rule.branch;
    RETURN NEXT;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------------------
-- 3. Update FAA rules with proper citations + URLs (these regulations are
--    public and well-documented).
-- ---------------------------------------------------------------------------

UPDATE currency_rules
SET
  required_event       = 'day_landings',
  description          = '14 CFR 61.57(a) — 3 takeoffs and 3 landings within preceding 90 days, in same category/class, to carry passengers (sole manipulator).',
  regulation_citation  = '14 CFR § 61.57(a)',
  regulation_url       = 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-A/section-61.57#p-61.57(a)',
  notes                = 'Tailwheel airplanes require full-stop landings. MilLogger does not yet enforce category/class matching — if you fly multiple categories, verify currency separately per category.'
WHERE name = 'FAA Day Passenger Currency';

UPDATE currency_rules
SET
  description          = '14 CFR 61.57(b) — 3 takeoffs and 3 full-stop landings during the period 1 hour after sunset to 1 hour before sunrise, within preceding 90 days, in same category/class.',
  regulation_citation  = '14 CFR § 61.57(b)',
  regulation_url       = 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-A/section-61.57#p-61.57(b)',
  notes                = 'MilLogger approximates "night full-stop landings" as LEAST(night_landings, full_stop_landings) per flight. If your night landings include touch-and-go, this will overcount. Track full-stop night landings explicitly for accuracy.'
WHERE name = 'FAA Night Passenger Currency';

UPDATE currency_rules
SET
  description          = '14 CFR 61.57(c) — Within preceding 6 calendar months, log 6 instrument approaches plus holding procedures and intercepting/tracking courses (in same category, in IMC or simulated).',
  regulation_citation  = '14 CFR § 61.57(c)',
  regulation_url       = 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-A/section-61.57#p-61.57(c)',
  notes                = 'MilLogger counts approach entries only. Holding and intercepting/tracking tasks are not yet validated separately. After the 6-month window, you have a 6-month grace period (61.57(c)(2)) to regain currency without an IPC.'
WHERE name = 'FAA IFR Currency';

UPDATE currency_rules
SET
  description          = '14 CFR 61.56 — Flight review with an authorized instructor within the preceding 24 calendar months. Minimum 1 hour ground + 1 hour flight.',
  regulation_citation  = '14 CFR § 61.56',
  regulation_url       = 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-A/section-61.56',
  notes                = 'Credit also applies for satisfactory completion of certain proficiency checks, WINGS phases, or new pilot certificates/ratings (see 61.56(d)–(g)).'
WHERE name = 'FAA Flight Review';

-- ---------------------------------------------------------------------------
-- 4. Deactivate the original made-up military rules.
--    These were not researched against authoritative pubs (AFMAN 11-202V1,
--    AFMAN 11-2T-6V1, AETCMAN 11-248, AR 95-1, OPNAV 3710.7, MCO 3710.6).
--    Existing user data is preserved; rules can be re-enabled and edited
--    once the user provides verified values from their unit publication.
-- ---------------------------------------------------------------------------

UPDATE currency_rules
SET
  is_active = false,
  notes = COALESCE(notes, '') ||
    E'\nDEACTIVATED 2026-04 — original seed values were not verified against authoritative pubs. Re-enable and edit with values from your unit publication (AFMAN 11-202V1, AFMAN 11-2T-6V1, AETCMAN 11-248, AR 95-1, OPNAV 3710.7, MCO 3710.6 as applicable).'
WHERE branch IS NOT NULL
  AND is_faa = false;
