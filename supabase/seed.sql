-- seed.sql
-- Comprehensive seed data for MissionReady360
-- Aircraft types and currency rules

-- =============================================================================
-- AIRCRAFT TYPES
-- =============================================================================

-- USAF Aircraft
INSERT INTO aircraft_types (designation, name, mds, branch, faa_category, faa_class, is_military, has_nvg, has_air_refueling, has_weapons, has_formation, has_airdrop, has_carrier, has_tactical, has_low_level, engine_count, engine_type)
VALUES
  ('F-16C', 'Fighting Falcon', 'F-16C', 'USAF', 'airplane', 'single_engine_land', true, true, true, true, true, false, false, true, true, 1, 'turbojet'),
  ('F-15E', 'Strike Eagle', 'F-15E', 'USAF', 'airplane', 'multi_engine_land', true, true, true, true, true, false, false, true, true, 2, 'turbojet'),
  ('F-35A', 'Lightning II', 'F-35A', 'USAF', 'airplane', 'single_engine_land', true, true, true, true, true, false, false, true, true, 1, 'turbojet'),
  ('C-17A', 'Globemaster III', 'C-17A', 'USAF', 'airplane', 'multi_engine_land', true, true, true, false, true, true, false, false, true, 4, 'turbofan'),
  ('C-130J', 'Super Hercules', 'C-130J', 'USAF', 'airplane', 'multi_engine_land', true, true, true, false, true, true, false, true, true, 4, 'turboprop'),
  ('KC-135R', 'Stratotanker', 'KC-135R', 'USAF', 'airplane', 'multi_engine_land', true, true, true, false, true, false, false, false, false, 4, 'turbofan'),
  ('KC-46A', 'Pegasus', 'KC-46A', 'USAF', 'airplane', 'multi_engine_land', true, true, true, false, true, false, false, false, false, 2, 'turbofan'),
  ('B-1B', 'Lancer', 'B-1B', 'USAF', 'airplane', 'multi_engine_land', true, true, true, true, true, false, false, true, true, 4, 'turbofan'),
  ('T-6A', 'Texan II', 'T-6A', 'USAF', 'airplane', 'single_engine_land', true, false, false, false, true, false, false, false, false, 1, 'turboprop'),
  ('T-38C', 'Talon', 'T-38C', 'USAF', 'airplane', 'multi_engine_land', true, false, false, false, true, false, false, false, false, 2, 'turbojet');

-- USN Aircraft
INSERT INTO aircraft_types (designation, name, mds, branch, faa_category, faa_class, is_military, has_nvg, has_air_refueling, has_weapons, has_formation, has_airdrop, has_carrier, has_tactical, has_low_level, engine_count, engine_type)
VALUES
  ('FA-18E', 'Super Hornet', 'FA-18E', 'USN', 'airplane', 'multi_engine_land', true, true, true, true, true, false, true, true, true, 2, 'turbofan'),
  ('FA-18F', 'Super Hornet (Two-Seat)', 'FA-18F', 'USN', 'airplane', 'multi_engine_land', true, true, true, true, true, false, true, true, true, 2, 'turbofan'),
  ('E-2D', 'Hawkeye', 'E-2D', 'USN', 'airplane', 'multi_engine_land', true, true, true, false, true, false, true, false, false, 2, 'turboprop'),
  ('P-8A', 'Poseidon', 'P-8A', 'USN', 'airplane', 'multi_engine_land', true, false, false, true, false, false, false, true, true, 2, 'turbofan'),
  ('T-45C', 'Goshawk', 'T-45C', 'USN', 'airplane', 'single_engine_land', true, false, false, false, true, false, true, false, false, 1, 'turbojet'),
  ('C-2A', 'Greyhound', 'C-2A', 'USN', 'airplane', 'multi_engine_land', true, true, false, false, true, false, true, false, false, 2, 'turboprop');

-- USMC Aircraft
INSERT INTO aircraft_types (designation, name, mds, branch, faa_category, faa_class, is_military, has_nvg, has_air_refueling, has_weapons, has_formation, has_airdrop, has_carrier, has_tactical, has_low_level, engine_count, engine_type)
VALUES
  ('MV-22B', 'Osprey', 'MV-22B', 'USMC', 'rotorcraft', NULL, true, true, true, false, true, false, true, true, true, 2, 'turboshaft'),
  ('AV-8B', 'Harrier II', 'AV-8B', 'USMC', 'airplane', 'single_engine_land', true, true, false, true, true, false, true, true, true, 1, 'turbojet'),
  ('CH-53E', 'Super Stallion', 'CH-53E', 'USMC', 'rotorcraft', NULL, true, true, true, false, true, false, true, true, true, 3, 'turboshaft');

-- USA Aircraft
INSERT INTO aircraft_types (designation, name, mds, branch, faa_category, faa_class, is_military, has_nvg, has_air_refueling, has_weapons, has_formation, has_airdrop, has_carrier, has_tactical, has_low_level, engine_count, engine_type)
VALUES
  ('UH-60M', 'Black Hawk', 'UH-60M', 'USA', 'rotorcraft', NULL, true, true, false, false, true, false, false, true, true, 2, 'turboshaft'),
  ('AH-64E', 'Apache', 'AH-64E', 'USA', 'rotorcraft', NULL, true, true, false, true, true, false, false, true, true, 2, 'turboshaft'),
  ('CH-47F', 'Chinook', 'CH-47F', 'USA', 'rotorcraft', NULL, true, true, false, false, true, false, false, true, true, 2, 'turboshaft');

-- Civilian Aircraft (for FAA currency tracking)
INSERT INTO aircraft_types (designation, name, mds, branch, faa_category, faa_class, faa_type_rating, is_military, has_nvg, has_air_refueling, has_weapons, has_formation, has_airdrop, has_carrier, has_tactical, has_low_level, engine_count, engine_type)
VALUES
  ('C172', 'Cessna 172 Skyhawk', NULL, NULL, 'airplane', 'single_engine_land', NULL, false, false, false, false, false, false, false, false, false, 1, 'piston'),
  ('PA-28', 'Piper Cherokee', NULL, NULL, 'airplane', 'single_engine_land', NULL, false, false, false, false, false, false, false, false, false, 1, 'piston'),
  ('BE-C90', 'Beechcraft King Air C90', NULL, NULL, 'airplane', 'multi_engine_land', 'BE-C90', false, false, false, false, false, false, false, false, false, 2, 'turboprop');


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
