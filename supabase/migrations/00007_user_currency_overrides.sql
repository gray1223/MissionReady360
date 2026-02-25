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
