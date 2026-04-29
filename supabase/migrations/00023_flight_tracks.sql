-- 00023_flight_tracks.sql
-- Track log + FR24 reference fields for flights imported from Flightradar24.
--
-- track_log holds the GPS trail as a compact JSONB array of position points:
--   [{ "t": "2026-04-15T13:45:00Z", "lat": 41.97, "lon": -87.90,
--      "alt": 35000, "gs": 480, "hdg": 270, "vs": 0 }, ...]
--
-- fr24_flight_id is the Flightradar24 internal ID (hex string) for the
-- imported flight; unique per user but not enforced (a flight can be
-- re-imported / overwritten).

ALTER TABLE flights
  ADD COLUMN IF NOT EXISTS track_log       JSONB,
  ADD COLUMN IF NOT EXISTS fr24_flight_id  TEXT;

CREATE INDEX IF NOT EXISTS idx_flights_fr24_flight_id
  ON flights (user_id, fr24_flight_id)
  WHERE fr24_flight_id IS NOT NULL;
