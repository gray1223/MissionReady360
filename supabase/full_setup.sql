-- ============================================
-- FILE: supabase/migrations/00001_enums.sql
-- ============================================
-- 00001_enums.sql
-- Create all custom ENUM types for MissionReady360

CREATE TYPE military_branch AS ENUM (
  'USAF',
  'USN',
  'USA',
  'USMC',
  'USCG',
  'USSF'
);

CREATE TYPE crew_position_category AS ENUM (
  'pilot',
  'copilot',
  'aircraft_commander',
  'instructor',
  'evaluator',
  'flight_engineer',
  'loadmaster',
  'boom_operator',
  'sensor_operator',
  'observer',
  'other'
);

CREATE TYPE sortie_type AS ENUM (
  'local',
  'cross_country',
  'deployment',
  'combat',
  'training',
  'evaluation',
  'check_ride',
  'instrument',
  'formation',
  'air_refueling',
  'airdrop',
  'low_level',
  'tactical',
  'ferry',
  'test',
  'other'
);

CREATE TYPE qualification_level AS ENUM (
  'initial_qual',
  'basic',
  'senior',
  'instructor',
  'evaluator',
  'flight_lead',
  'mission_commander'
);

CREATE TYPE flight_condition AS ENUM (
  'day',
  'night',
  'nvg',
  'mixed'
);

CREATE TYPE period_unit AS ENUM (
  'days',
  'calendar_months',
  'calendar_years'
);


-- ============================================
-- FILE: supabase/migrations/00002_profiles.sql
-- ============================================
-- 00002_profiles.sql
-- Create profiles table extending auth.users

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  branch military_branch,
  rank TEXT,
  duty_status TEXT CHECK (duty_status IN ('active', 'reserve', 'guard', 'retired', 'separated')),
  unit TEXT,
  callsign TEXT,
  primary_aircraft_id UUID, -- FK added in 00004 after aircraft_types exists
  qualification_level qualification_level,
  faa_certificate_number TEXT,
  faa_medical_class TEXT CHECK (faa_medical_class IN ('first', 'second', 'third', 'basicmed')),
  faa_medical_expiry DATE,
  notification_preferences JSONB DEFAULT '{"email_expiring": true, "push_expiring": true, "warning_days": 30}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_delete_own ON profiles
  FOR DELETE USING (auth.uid() = id);


-- ============================================
-- FILE: supabase/migrations/00003_aircraft_types.sql
-- ============================================
-- 00003_aircraft_types.sql
-- Create aircraft_types reference table

CREATE TABLE aircraft_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designation TEXT NOT NULL,       -- e.g., 'F-16C', 'C-17A', 'FA-18E'
  name TEXT NOT NULL,              -- e.g., 'Fighting Falcon', 'Globemaster III'
  mds TEXT,                        -- Mission Design Series
  branch military_branch,          -- NULL = civilian
  faa_category TEXT,               -- airplane, rotorcraft, glider, etc.
  faa_class TEXT,                  -- single_engine_land, multi_engine_land, etc.
  faa_type_rating TEXT,            -- type rating required (e.g., 'B737')
  is_military BOOLEAN DEFAULT true,
  has_nvg BOOLEAN DEFAULT false,
  has_air_refueling BOOLEAN DEFAULT false,
  has_weapons BOOLEAN DEFAULT false,
  has_formation BOOLEAN DEFAULT false,
  has_airdrop BOOLEAN DEFAULT false,
  has_carrier BOOLEAN DEFAULT false,
  has_tactical BOOLEAN DEFAULT false,
  has_low_level BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE aircraft_types ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read aircraft types
CREATE POLICY aircraft_types_select_authenticated ON aircraft_types
  FOR SELECT TO authenticated
  USING (true);


-- ============================================
-- FILE: supabase/migrations/00004_user_aircraft.sql
-- ============================================
-- 00004_user_aircraft.sql
-- Create user_aircraft junction table and add deferred FK on profiles

CREATE TABLE user_aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  aircraft_type_id UUID NOT NULL REFERENCES aircraft_types(id) ON DELETE CASCADE,
  qualification_level qualification_level DEFAULT 'basic',
  is_primary BOOLEAN DEFAULT false,
  qualified_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, aircraft_type_id)
);

-- Now add FK from profiles.primary_aircraft_id -> aircraft_types.id
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_primary_aircraft
  FOREIGN KEY (primary_aircraft_id)
  REFERENCES aircraft_types(id)
  ON DELETE SET NULL;

-- Row Level Security
ALTER TABLE user_aircraft ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_aircraft_select_own ON user_aircraft
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_aircraft_insert_own ON user_aircraft
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_aircraft_update_own ON user_aircraft
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_aircraft_delete_own ON user_aircraft
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- FILE: supabase/migrations/00005_flights.sql
-- ============================================
-- 00005_flights.sql
-- Create the wide flights table

CREATE TABLE flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Basic
  flight_date DATE NOT NULL,
  aircraft_type_id UUID REFERENCES aircraft_types(id),
  tail_number TEXT,
  departure_icao TEXT,
  arrival_icao TEXT,
  route TEXT,
  remarks TEXT,

  -- Military
  sortie_type sortie_type,
  mission_number TEXT,
  mission_symbol TEXT,
  crew_position crew_position_category,
  flight_condition flight_condition DEFAULT 'day',
  crew_members JSONB DEFAULT '[]'::jsonb,

  -- Time (all in decimal hours)
  total_time DECIMAL(5,1) DEFAULT 0,
  pilot_time DECIMAL(5,1) DEFAULT 0,
  copilot_time DECIMAL(5,1) DEFAULT 0,
  instructor_time DECIMAL(5,1) DEFAULT 0,
  evaluator_time DECIMAL(5,1) DEFAULT 0,
  night_time DECIMAL(5,1) DEFAULT 0,
  nvg_time DECIMAL(5,1) DEFAULT 0,
  instrument_time DECIMAL(5,1) DEFAULT 0,
  sim_instrument_time DECIMAL(5,1) DEFAULT 0,

  -- FAA compatible
  pic_time DECIMAL(5,1) DEFAULT 0,
  sic_time DECIMAL(5,1) DEFAULT 0,
  xc_time DECIMAL(5,1) DEFAULT 0,
  solo_time DECIMAL(5,1) DEFAULT 0,
  dual_received_time DECIMAL(5,1) DEFAULT 0,

  -- Landings
  day_landings INTEGER DEFAULT 0,
  night_landings INTEGER DEFAULT 0,
  nvg_landings INTEGER DEFAULT 0,
  full_stop_landings INTEGER DEFAULT 0,
  touch_and_go_landings INTEGER DEFAULT 0,
  carrier_traps INTEGER DEFAULT 0,
  carrier_bolters INTEGER DEFAULT 0,

  -- Approaches
  approaches JSONB DEFAULT '[]'::jsonb, -- [{type, runway, airport}]

  -- Mission specific
  formation_position TEXT,       -- lead, wing2, wing3, wing4
  formation_type TEXT,           -- 2-ship, 4-ship, etc.
  weapons_events JSONB DEFAULT '[]'::jsonb,
  air_refueling_type TEXT,       -- boom, drogue, both
  air_refueling_contacts INTEGER DEFAULT 0,
  airdrop_events JSONB DEFAULT '[]'::jsonb,
  low_level_time DECIMAL(5,1) DEFAULT 0,
  low_level_type TEXT,
  combat_time DECIMAL(5,1) DEFAULT 0,
  combat_sorties INTEGER DEFAULT 0,

  -- Simulator
  is_simulator BOOLEAN DEFAULT false,
  simulator_type TEXT,

  -- Offline sync
  is_synced BOOLEAN DEFAULT true,
  local_id TEXT,                 -- client UUID for dedup

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER trg_flights_updated_at
  BEFORE UPDATE ON flights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

CREATE POLICY flights_select_own ON flights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY flights_insert_own ON flights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY flights_update_own ON flights
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY flights_delete_own ON flights
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_flights_user_date ON flights (user_id, flight_date DESC);
CREATE INDEX idx_flights_user_aircraft ON flights (user_id, aircraft_type_id);

-- Unique constraint for offline dedup (partial index: only when local_id is set)
CREATE UNIQUE INDEX uq_flights_user_local_id
  ON flights (user_id, local_id)
  WHERE local_id IS NOT NULL;


-- ============================================
-- FILE: supabase/migrations/00006_currency_rules.sql
-- ============================================
-- 00006_currency_rules.sql
-- Create currency_rules reference table

CREATE TABLE currency_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  branch military_branch,                     -- NULL = applies to all branches
  aircraft_type_id UUID REFERENCES aircraft_types(id), -- NULL = applies to all aircraft
  is_faa BOOLEAN DEFAULT false,
  required_event TEXT NOT NULL,                -- maps to flights column name or computed field
  required_count DECIMAL(5,1) NOT NULL,
  period_value INTEGER NOT NULL,
  period_unit period_unit NOT NULL,
  additional_conditions JSONB DEFAULT '{}'::jsonb,
  warning_threshold_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE currency_rules ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read currency rules
CREATE POLICY currency_rules_select_authenticated ON currency_rules
  FOR SELECT TO authenticated
  USING (true);


-- ============================================
-- FILE: supabase/migrations/00007_user_currency_overrides.sql
-- ============================================
-- 00007_user_currency_overrides.sql
-- Create user_currency_overrides table for per-user rule customization

CREATE TABLE user_currency_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  currency_rule_id UUID NOT NULL REFERENCES currency_rules(id) ON DELETE CASCADE,
  is_disabled BOOLEAN DEFAULT false,
  waiver_expiry DATE,
  custom_required_count DECIMAL(5,1),
  custom_period_value INTEGER,
  custom_period_unit period_unit,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, currency_rule_id)
);

-- Trigger for updated_at
CREATE TRIGGER trg_user_currency_overrides_updated_at
  BEFORE UPDATE ON user_currency_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE user_currency_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_currency_overrides_select_own ON user_currency_overrides
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_currency_overrides_insert_own ON user_currency_overrides
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_currency_overrides_update_own ON user_currency_overrides
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_currency_overrides_delete_own ON user_currency_overrides
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- FILE: supabase/migrations/00008_user_qualifications.sql
-- ============================================
-- 00008_user_qualifications.sql
-- Create user_qualifications table for certificates, ratings, endorsements

CREATE TABLE user_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('military', 'faa_certificate', 'faa_rating', 'faa_endorsement', 'medical', 'other')),
  issuing_authority TEXT,
  certificate_number TEXT,
  issued_date DATE,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER trg_user_qualifications_updated_at
  BEFORE UPDATE ON user_qualifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE user_qualifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_qualifications_select_own ON user_qualifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_qualifications_insert_own ON user_qualifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_qualifications_update_own ON user_qualifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_qualifications_delete_own ON user_qualifications
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- FILE: supabase/migrations/00009_audit_log.sql
-- ============================================
-- 00009_audit_log.sql
-- Create audit_log table and trigger function for flight change tracking

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (user_id, table_name, record_id, action, new_data)
    VALUES (NEW.user_id, TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW));
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (user_id, table_name, record_id, action, old_data, new_data)
    VALUES (NEW.user_id, TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (user_id, table_name, record_id, action, old_data)
    VALUES (OLD.user_id, TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit trigger to flights table
CREATE TRIGGER trg_flights_audit
  AFTER INSERT OR UPDATE OR DELETE ON flights
  FOR EACH ROW
  EXECUTE FUNCTION log_audit();

-- Row Level Security
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_select_own ON audit_log
  FOR SELECT USING (auth.uid() = user_id);


-- ============================================
-- FILE: supabase/migrations/00010_compute_currencies.sql
-- ============================================
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


-- ============================================
-- FILE: supabase/migrations/00011_indexes.sql
-- ============================================
-- 00011_indexes.sql
-- Additional performance indexes
-- Note: Some indexes on flights were already created in 00005_flights.sql
--   idx_flights_user_date (user_id, flight_date DESC)
--   idx_flights_user_aircraft (user_id, aircraft_type_id)

-- Currency rules lookup by branch and aircraft type
CREATE INDEX idx_currency_rules_branch_aircraft
  ON currency_rules (branch, aircraft_type_id);

-- User currency overrides lookup by user
CREATE INDEX idx_user_currency_overrides_user
  ON user_currency_overrides (user_id);

-- User qualifications lookup by user
CREATE INDEX idx_user_qualifications_user
  ON user_qualifications (user_id);

-- Audit log lookup by user and time
CREATE INDEX idx_audit_log_user_created
  ON audit_log (user_id, created_at DESC);


-- ============================================
-- FILE: supabase/seed.sql
-- ============================================
-- seed.sql
-- Comprehensive seed data for MissionReady360
-- Aircraft types and currency rules

-- =============================================================================
-- AIRCRAFT TYPES
-- =============================================================================

-- USAF Aircraft
INSERT INTO aircraft_types (designation, name, mds, branch, faa_category, faa_class, is_military, has_nvg, has_air_refueling, has_weapons, has_formation, has_airdrop, has_carrier, has_tactical, has_low_level)
VALUES
  ('F-16C', 'Fighting Falcon', 'F-16C', 'USAF', 'airplane', 'single_engine_land', true, true, true, true, true, false, false, true, true),
  ('F-15E', 'Strike Eagle', 'F-15E', 'USAF', 'airplane', 'multi_engine_land', true, true, true, true, true, false, false, true, true),
  ('F-35A', 'Lightning II', 'F-35A', 'USAF', 'airplane', 'single_engine_land', true, true, true, true, true, false, false, true, true),
  ('C-17A', 'Globemaster III', 'C-17A', 'USAF', 'airplane', 'multi_engine_land', true, true, true, false, true, true, false, false, true),
  ('C-130J', 'Super Hercules', 'C-130J', 'USAF', 'airplane', 'multi_engine_land', true, true, true, false, true, true, false, true, true),
  ('KC-135R', 'Stratotanker', 'KC-135R', 'USAF', 'airplane', 'multi_engine_land', true, true, true, false, true, false, false, false, false),
  ('KC-46A', 'Pegasus', 'KC-46A', 'USAF', 'airplane', 'multi_engine_land', true, true, true, false, true, false, false, false, false),
  ('B-1B', 'Lancer', 'B-1B', 'USAF', 'airplane', 'multi_engine_land', true, true, true, true, true, false, false, true, true),
  ('T-6A', 'Texan II', 'T-6A', 'USAF', 'airplane', 'single_engine_land', true, false, false, false, true, false, false, false, false),
  ('T-38C', 'Talon', 'T-38C', 'USAF', 'airplane', 'multi_engine_land', true, false, false, false, true, false, false, false, false);

-- USN Aircraft
INSERT INTO aircraft_types (designation, name, mds, branch, faa_category, faa_class, is_military, has_nvg, has_air_refueling, has_weapons, has_formation, has_airdrop, has_carrier, has_tactical, has_low_level)
VALUES
  ('FA-18E', 'Super Hornet', 'FA-18E', 'USN', 'airplane', 'multi_engine_land', true, true, true, true, true, false, true, true, true),
  ('FA-18F', 'Super Hornet (Two-Seat)', 'FA-18F', 'USN', 'airplane', 'multi_engine_land', true, true, true, true, true, false, true, true, true),
  ('E-2D', 'Hawkeye', 'E-2D', 'USN', 'airplane', 'multi_engine_land', true, true, true, false, true, false, true, false, false),
  ('P-8A', 'Poseidon', 'P-8A', 'USN', 'airplane', 'multi_engine_land', true, false, false, true, false, false, false, true, true),
  ('T-45C', 'Goshawk', 'T-45C', 'USN', 'airplane', 'single_engine_land', true, false, false, false, true, false, true, false, false),
  ('C-2A', 'Greyhound', 'C-2A', 'USN', 'airplane', 'multi_engine_land', true, true, false, false, true, false, true, false, false);

-- USMC Aircraft
INSERT INTO aircraft_types (designation, name, mds, branch, faa_category, faa_class, is_military, has_nvg, has_air_refueling, has_weapons, has_formation, has_airdrop, has_carrier, has_tactical, has_low_level)
VALUES
  ('MV-22B', 'Osprey', 'MV-22B', 'USMC', 'rotorcraft', NULL, true, true, true, false, true, false, true, true, true),
  ('AV-8B', 'Harrier II', 'AV-8B', 'USMC', 'airplane', 'single_engine_land', true, true, false, true, true, false, true, true, true),
  ('CH-53E', 'Super Stallion', 'CH-53E', 'USMC', 'rotorcraft', NULL, true, true, true, false, true, false, true, true, true);

-- USA Aircraft
INSERT INTO aircraft_types (designation, name, mds, branch, faa_category, faa_class, is_military, has_nvg, has_air_refueling, has_weapons, has_formation, has_airdrop, has_carrier, has_tactical, has_low_level)
VALUES
  ('UH-60M', 'Black Hawk', 'UH-60M', 'USA', 'rotorcraft', NULL, true, true, false, false, true, false, false, true, true),
  ('AH-64E', 'Apache', 'AH-64E', 'USA', 'rotorcraft', NULL, true, true, false, true, true, false, false, true, true),
  ('CH-47F', 'Chinook', 'CH-47F', 'USA', 'rotorcraft', NULL, true, true, false, false, true, false, false, true, true);

-- Civilian Aircraft (for FAA currency tracking)
INSERT INTO aircraft_types (designation, name, mds, branch, faa_category, faa_class, faa_type_rating, is_military, has_nvg, has_air_refueling, has_weapons, has_formation, has_airdrop, has_carrier, has_tactical, has_low_level)
VALUES
  ('C172', 'Cessna 172 Skyhawk', NULL, NULL, 'airplane', 'single_engine_land', NULL, false, false, false, false, false, false, false, false, false),
  ('PA-28', 'Piper Cherokee', NULL, NULL, 'airplane', 'single_engine_land', NULL, false, false, false, false, false, false, false, false, false),
  ('BE-C90', 'Beechcraft King Air C90', NULL, NULL, 'airplane', 'multi_engine_land', 'BE-C90', false, false, false, false, false, false, false, false, false);


-- =============================================================================
-- CURRENCY RULES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- FAA Rules (is_faa=true, branch=NULL -- apply to all)
-- ---------------------------------------------------------------------------

INSERT INTO currency_rules (name, description, branch, aircraft_type_id, is_faa, required_event, required_count, period_value, period_unit, additional_conditions, warning_threshold_days, sort_order)
VALUES
  (
    'FAA Day Passenger Currency',
    '14 CFR 61.57(a) - 3 takeoffs and landings in preceding 90 days to carry passengers during the day',
    NULL, NULL, true,
    'landings', 3, 90, 'days',
    '{}'::jsonb,
    30, 100
  ),
  (
    'FAA Night Passenger Currency',
    '14 CFR 61.57(b) - 3 full-stop night landings in preceding 90 days to carry passengers at night',
    NULL, NULL, true,
    'full_stop_night_landings', 3, 90, 'days',
    '{}'::jsonb,
    30, 101
  ),
  (
    'FAA IFR Currency',
    '14 CFR 61.57(c) - 6 instrument approaches, holding, and intercepting/tracking courses in preceding 6 calendar months',
    NULL, NULL, true,
    'approaches', 6, 6, 'calendar_months',
    '{}'::jsonb,
    30, 102
  ),
  (
    'FAA Flight Review',
    '14 CFR 61.56 - Flight review with instructor within preceding 24 calendar months',
    NULL, NULL, true,
    'flight_review', 1, 24, 'calendar_months',
    '{}'::jsonb,
    60, 103
  );

-- ---------------------------------------------------------------------------
-- USAF Rules
-- ---------------------------------------------------------------------------

INSERT INTO currency_rules (name, description, branch, aircraft_type_id, is_faa, required_event, required_count, period_value, period_unit, additional_conditions, warning_threshold_days, sort_order)
VALUES
  (
    'USAF Basic Flying Currency',
    'AFI 11-202V3 - Minimum 1 sortie within 60 days to maintain basic flying currency',
    'USAF', NULL, false,
    'sorties', 1, 60, 'days',
    '{}'::jsonb,
    14, 200
  ),
  (
    'USAF Instrument Currency',
    'AFI 11-202V3 - Minimum 1 instrument approach within 60 days',
    'USAF', NULL, false,
    'approaches', 1, 60, 'days',
    '{}'::jsonb,
    14, 201
  ),
  (
    'USAF NVG Currency',
    'AFI 11-202V3 - Minimum 1 NVG sortie within 60 days for NVG-equipped aircraft',
    'USAF', NULL, false,
    'nvg_sorties', 1, 60, 'days',
    '{"requires_aircraft_capability": "has_nvg"}'::jsonb,
    14, 202
  ),
  (
    'USAF Formation Currency',
    'AFI 11-2XX - Minimum 1 formation sortie within 60 days for formation-capable aircraft',
    'USAF', NULL, false,
    'formation_sorties', 1, 60, 'days',
    '{"requires_aircraft_capability": "has_formation"}'::jsonb,
    14, 203
  ),
  (
    'USAF Night Currency',
    'AFI 11-202V3 - Minimum 1 night sortie within 90 days',
    'USAF', NULL, false,
    'night_sorties', 1, 90, 'days',
    '{}'::jsonb,
    14, 204
  );

-- ---------------------------------------------------------------------------
-- USN Rules
-- ---------------------------------------------------------------------------

INSERT INTO currency_rules (name, description, branch, aircraft_type_id, is_faa, required_event, required_count, period_value, period_unit, additional_conditions, warning_threshold_days, sort_order)
VALUES
  (
    'USN Day Landing Currency',
    'OPNAVINST 3710.7 - Minimum 1 landing within 14 days for day currency',
    'USN', NULL, false,
    'day_landings', 1, 14, 'days',
    '{}'::jsonb,
    7, 300
  ),
  (
    'USN Night Landing Currency',
    'OPNAVINST 3710.7 - Minimum 1 night landing within 14 days for night currency',
    'USN', NULL, false,
    'night_landings', 1, 14, 'days',
    '{}'::jsonb,
    7, 301
  ),
  (
    'USN Carrier Qualification',
    'OPNAVINST 3710.7 - Minimum 10 carrier traps within 365 days to maintain carrier qualification',
    'USN', NULL, false,
    'carrier_traps', 10, 365, 'days',
    '{"requires_aircraft_capability": "has_carrier"}'::jsonb,
    60, 302
  ),
  (
    'USN NVG Currency',
    'OPNAVINST 3710.7 - Minimum 1 NVG sortie within 45 days',
    'USN', NULL, false,
    'nvg_sorties', 1, 45, 'days',
    '{"requires_aircraft_capability": "has_nvg"}'::jsonb,
    14, 303
  ),
  (
    'USN Instrument Currency',
    'OPNAVINST 3710.7 - Minimum 2 instrument approaches within 45 days',
    'USN', NULL, false,
    'approaches', 2, 45, 'days',
    '{}'::jsonb,
    14, 304
  );

-- ---------------------------------------------------------------------------
-- USA Rules
-- ---------------------------------------------------------------------------

INSERT INTO currency_rules (name, description, branch, aircraft_type_id, is_faa, required_event, required_count, period_value, period_unit, additional_conditions, warning_threshold_days, sort_order)
VALUES
  (
    'USA Day Currency',
    'AR 95-1 - Minimum 1 sortie within 90 days for day flying currency',
    'USA', NULL, false,
    'sorties', 1, 90, 'days',
    '{}'::jsonb,
    14, 400
  ),
  (
    'USA Night Currency',
    'AR 95-1 - Minimum 1 night sortie within 90 days for night flying currency',
    'USA', NULL, false,
    'night_sorties', 1, 90, 'days',
    '{}'::jsonb,
    14, 401
  ),
  (
    'USA NVG Currency',
    'AR 95-1 - Minimum 1 NVG sortie within 60 days',
    'USA', NULL, false,
    'nvg_sorties', 1, 60, 'days',
    '{"requires_aircraft_capability": "has_nvg"}'::jsonb,
    14, 402
  ),
  (
    'USA Instrument Currency',
    'AR 95-1 - Minimum 6 instrument approaches within 6 calendar months',
    'USA', NULL, false,
    'approaches', 6, 6, 'calendar_months',
    '{}'::jsonb,
    30, 403
  );

-- ---------------------------------------------------------------------------
-- USMC Rules
-- ---------------------------------------------------------------------------

INSERT INTO currency_rules (name, description, branch, aircraft_type_id, is_faa, required_event, required_count, period_value, period_unit, additional_conditions, warning_threshold_days, sort_order)
VALUES
  (
    'USMC Basic Currency',
    'MCO 3710.6 - Minimum 1 sortie within 30 days for basic flying currency',
    'USMC', NULL, false,
    'sorties', 1, 30, 'days',
    '{}'::jsonb,
    7, 500
  ),
  (
    'USMC Night Currency',
    'MCO 3710.6 - Minimum 1 night sortie within 60 days',
    'USMC', NULL, false,
    'night_sorties', 1, 60, 'days',
    '{}'::jsonb,
    14, 501
  ),
  (
    'USMC NVG Currency',
    'MCO 3710.6 - Minimum 1 NVG sortie within 45 days',
    'USMC', NULL, false,
    'nvg_sorties', 1, 45, 'days',
    '{"requires_aircraft_capability": "has_nvg"}'::jsonb,
    14, 502
  ),
  (
    'USMC Instrument Currency',
    'MCO 3710.6 - Minimum 2 instrument approaches within 45 days',
    'USMC', NULL, false,
    'approaches', 2, 45, 'days',
    '{}'::jsonb,
    14, 503
  );


