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
