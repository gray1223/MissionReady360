-- Boldface Progress: Leitner-box spaced-repetition tracking per user/airframe/item
CREATE TABLE IF NOT EXISTS boldface_progress (
  user_id              uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  airframe             text NOT NULL,
  item_id              text NOT NULL,
  box                  int  NOT NULL DEFAULT 1,
  next_due_at          timestamptz NOT NULL DEFAULT now(),
  total_attempts       int  NOT NULL DEFAULT 0,
  correct_attempts     int  NOT NULL DEFAULT 0,
  last_attempted_at    timestamptz,
  last_response_text   text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, airframe, item_id)
);

-- Fast lookup of items due for a user
CREATE INDEX IF NOT EXISTS idx_boldface_progress_due
  ON boldface_progress (user_id, airframe, next_due_at);

-- RLS
ALTER TABLE boldface_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own boldface progress"
  ON boldface_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own boldface progress"
  ON boldface_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own boldface progress"
  ON boldface_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own boldface progress"
  ON boldface_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION boldface_progress_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_boldface_progress_updated_at ON boldface_progress;
CREATE TRIGGER trg_boldface_progress_updated_at
  BEFORE UPDATE ON boldface_progress
  FOR EACH ROW EXECUTE FUNCTION boldface_progress_set_updated_at();
