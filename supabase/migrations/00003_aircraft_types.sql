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
