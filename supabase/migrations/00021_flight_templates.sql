-- Flight Templates: user-saved sortie patterns for one-tap prefill
CREATE TABLE IF NOT EXISTS flight_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  payload     jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flight_templates_user
  ON flight_templates (user_id, created_at DESC);

ALTER TABLE flight_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own flight templates"
  ON flight_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own flight templates"
  ON flight_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own flight templates"
  ON flight_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own flight templates"
  ON flight_templates FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION flight_templates_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_flight_templates_updated_at ON flight_templates;
CREATE TRIGGER trg_flight_templates_updated_at
  BEFORE UPDATE ON flight_templates
  FOR EACH ROW EXECUTE FUNCTION flight_templates_set_updated_at();
