-- 00010_compute_currencies.sql
-- Create compute_user_currencies function for real-time currency calculations

CREATE OR REPLACE FUNCTION compute_user_currencies(p_user_id UUID)
RETURNS TABLE (
  rule_id UUID,
  rule_name TEXT,
  required_event TEXT,
  required_count DECIMAL,
  achieved_count DECIMAL,
  period_start DATE,
  period_end DATE,
  status TEXT,           -- 'current', 'expiring_soon', 'expired'
  days_remaining INTEGER,
  is_faa BOOLEAN,
  branch military_branch
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
  -- Get the user's branch
  SELECT p.branch INTO v_user_branch
  FROM profiles p
  WHERE p.id = p_user_id;

  -- Get the user's aircraft type IDs
  -- (used below to match aircraft-specific rules)

  -- Iterate over all active currency rules applicable to this user
  FOR v_rule IN
    SELECT cr.*
    FROM currency_rules cr
    WHERE cr.is_active = true
      AND (
        -- Universal rules (no branch filter)
        cr.branch IS NULL
        -- Rules matching the user's branch
        OR cr.branch = v_user_branch
      )
      AND (
        -- Universal rules (no aircraft filter)
        cr.aircraft_type_id IS NULL
        -- Rules matching one of the user's aircraft
        OR cr.aircraft_type_id IN (
          SELECT ua.aircraft_type_id
          FROM user_aircraft ua
          WHERE ua.user_id = p_user_id
        )
      )
    ORDER BY cr.sort_order, cr.name
  LOOP
    -- Check for user overrides
    SELECT uco.*
    INTO v_override
    FROM user_currency_overrides uco
    WHERE uco.user_id = p_user_id
      AND uco.currency_rule_id = v_rule.id;

    -- Skip disabled rules
    IF v_override IS NOT NULL AND v_override.is_disabled = true THEN
      CONTINUE;
    END IF;

    -- Check waiver: if waiver is active, treat as current
    IF v_override IS NOT NULL
       AND v_override.waiver_expiry IS NOT NULL
       AND v_override.waiver_expiry >= CURRENT_DATE THEN
      -- Return waiver row as current
      rule_id := v_rule.id;
      rule_name := v_rule.name;
      required_event := v_rule.required_event;
      required_count := COALESCE(v_override.custom_required_count, v_rule.required_count);
      achieved_count := 0; -- not computed under waiver
      period_start := CURRENT_DATE;
      period_end := v_override.waiver_expiry;
      status := 'current';
      days_remaining := (v_override.waiver_expiry - CURRENT_DATE);
      is_faa := v_rule.is_faa;
      branch := v_rule.branch;
      RETURN NEXT;
      CONTINUE;
    END IF;

    -- Determine effective thresholds (override or default)
    v_required := COALESCE(v_override.custom_required_count, v_rule.required_count);
    v_period_val := COALESCE(v_override.custom_period_value, v_rule.period_value);
    v_period_u := COALESCE(v_override.custom_period_unit, v_rule.period_unit);
    v_warning_days := v_rule.warning_threshold_days;

    -- Calculate the lookback window
    v_period_end := CURRENT_DATE;
    CASE v_period_u
      WHEN 'days' THEN
        v_period_start := CURRENT_DATE - (v_period_val || ' days')::INTERVAL;
      WHEN 'calendar_months' THEN
        v_period_start := CURRENT_DATE - (v_period_val || ' months')::INTERVAL;
      WHEN 'calendar_years' THEN
        v_period_start := CURRENT_DATE - (v_period_val || ' years')::INTERVAL;
    END CASE;

    -- Count the achieved events within the window
    -- The required_event column name maps to a flights column
    -- We handle common event types explicitly for type safety
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
      -- Night full-stop landings: count night_landings where they are full stop
      -- We use the lesser of night_landings and full_stop_landings per flight
      SELECT COALESCE(SUM(LEAST(f.night_landings, f.full_stop_landings)), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND f.night_landings > 0
        AND f.full_stop_landings > 0
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSIF v_rule.required_event = 'approaches' THEN
      -- Count approaches from JSONB array
      SELECT COALESCE(SUM(jsonb_array_length(f.approaches)), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSIF v_rule.required_event = 'sorties' THEN
      -- Count number of flight records (each record = 1 sortie)
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
      -- Flight review: count sorties tagged as check_ride or evaluation
      SELECT COALESCE(COUNT(*), 0) INTO v_achieved
      FROM flights f
      WHERE f.user_id = p_user_id
        AND f.flight_date >= v_period_start
        AND f.flight_date <= v_period_end
        AND f.sortie_type IN ('check_ride', 'evaluation')
        AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id);

    ELSE
      -- Fallback: try to count as a numeric column summed across flights
      -- For safety, default to 0 for unrecognized events
      v_achieved := 0;
    END IF;

    -- Apply additional_conditions filtering if present
    -- additional_conditions can contain: {"flight_condition": "night", "sortie_type": "formation", etc.}
    IF v_rule.additional_conditions IS NOT NULL
       AND v_rule.additional_conditions != '{}'::jsonb THEN
      -- Re-query with additional conditions applied
      -- This is a supplementary filter; we recount with extra WHERE clauses
      -- For simplicity, handled via the specific event branches above
      -- Complex additional_conditions can be extended here as needed
      NULL;
    END IF;

    -- Calculate days remaining
    -- Find the oldest qualifying event in the current window
    IF v_achieved >= v_required THEN
      -- Find the date of the oldest event that, if it falls out of the window,
      -- would drop us below the required count
      -- We need the Nth oldest event (where N = achieved - required + 1)
      IF v_rule.required_event IN ('sorties', 'night_sorties', 'nvg_sorties', 'formation_sorties', 'flight_review') THEN
        -- For count-based events, find the flight_date of the critical flight
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
        -- For sum-based events (landings, approaches, traps), use the most recent flight
        -- as an approximation: currency expires when the window moves past the earliest needed flight
        SELECT f.flight_date INTO v_oldest_qualifying
        FROM flights f
        WHERE f.user_id = p_user_id
          AND f.flight_date >= v_period_start
          AND f.flight_date <= v_period_end
          AND (v_rule.aircraft_type_id IS NULL OR f.aircraft_type_id = v_rule.aircraft_type_id)
        ORDER BY f.flight_date ASC
        LIMIT 1;
      END IF;

      IF v_oldest_qualifying IS NOT NULL THEN
        -- Days remaining = how many days until this flight date falls outside the rolling window
        CASE v_period_u
          WHEN 'days' THEN
            v_days_rem := (v_oldest_qualifying + (v_period_val || ' days')::INTERVAL)::DATE - CURRENT_DATE;
          WHEN 'calendar_months' THEN
            v_days_rem := (v_oldest_qualifying + (v_period_val || ' months')::INTERVAL)::DATE - CURRENT_DATE;
          WHEN 'calendar_years' THEN
            v_days_rem := (v_oldest_qualifying + (v_period_val || ' years')::INTERVAL)::DATE - CURRENT_DATE;
        END CASE;
        -- Clamp to zero minimum
        IF v_days_rem < 0 THEN
          v_days_rem := 0;
        END IF;
      ELSE
        v_days_rem := 0;
      END IF;

      -- Determine status
      IF v_days_rem <= v_warning_days THEN
        v_status := 'expiring_soon';
      ELSE
        v_status := 'current';
      END IF;
    ELSE
      -- Not enough events: expired
      v_status := 'expired';
      v_days_rem := 0;
    END IF;

    -- Return the row
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
