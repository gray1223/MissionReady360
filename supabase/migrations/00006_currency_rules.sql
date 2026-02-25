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
