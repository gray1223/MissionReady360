-- EP Practice Sessions table
CREATE TABLE IF NOT EXISTS ep_practice_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           text NOT NULL,
  scenario_type   text,
  started_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz,
  duration_seconds integer,
  setup_data      jsonb DEFAULT '{}',
  messages        jsonb NOT NULL DEFAULT '[]',
  current_phase   text DEFAULT 'setup',
  phases_completed text[] DEFAULT '{}',
  evaluation      jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Index for querying user's sessions
CREATE INDEX IF NOT EXISTS idx_ep_sessions_user_started
  ON ep_practice_sessions (user_id, started_at DESC);

-- RLS
ALTER TABLE ep_practice_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own EP sessions"
  ON ep_practice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own EP sessions"
  ON ep_practice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own EP sessions"
  ON ep_practice_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own EP sessions"
  ON ep_practice_sessions FOR DELETE
  USING (auth.uid() = user_id);
