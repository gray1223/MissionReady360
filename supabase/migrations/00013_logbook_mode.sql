-- Add logbook mode and civilian profile fields to profiles
ALTER TABLE profiles
  ADD COLUMN logbook_mode TEXT DEFAULT 'military'
    CHECK (logbook_mode IN ('military', 'civilian')),
  ADD COLUMN first_name TEXT,
  ADD COLUMN last_name TEXT,
  ADD COLUMN home_airport TEXT,
  ADD COLUMN certificate_type TEXT
    CHECK (certificate_type IN ('none','student','sport','recreational','private','commercial','atp'));

-- Add is_military_flight flag to flights
ALTER TABLE flights ADD COLUMN is_military_flight BOOLEAN;

-- Backfill from aircraft_types.is_military, defaulting to true
UPDATE flights f SET is_military_flight = COALESCE(
  (SELECT at.is_military FROM aircraft_types at WHERE at.id = f.aircraft_type_id), true);

ALTER TABLE flights
  ALTER COLUMN is_military_flight SET DEFAULT true,
  ALTER COLUMN is_military_flight SET NOT NULL;

-- Index for mode-filtered queries
CREATE INDEX idx_flights_user_military ON flights (user_id, is_military_flight, flight_date DESC);
