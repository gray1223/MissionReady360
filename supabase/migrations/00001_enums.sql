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
