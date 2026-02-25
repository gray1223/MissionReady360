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
