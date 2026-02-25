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
