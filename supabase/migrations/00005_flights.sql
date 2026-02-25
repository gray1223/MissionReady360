-- 00005_flights.sql
-- Create the wide flights table

CREATE TABLE flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Basic
  flight_date DATE NOT NULL,
  aircraft_type_id UUID REFERENCES aircraft_types(id),
  tail_number TEXT,
  departure_icao TEXT,
  arrival_icao TEXT,
  route TEXT,
  remarks TEXT,

  -- Military
  sortie_type sortie_type,
  mission_number TEXT,
  mission_symbol TEXT,
  crew_position crew_position_category,
  flight_condition flight_condition DEFAULT 'day',
  crew_members JSONB DEFAULT '[]'::jsonb,

  -- Time (all in decimal hours)
  total_time DECIMAL(5,1) DEFAULT 0,
  pilot_time DECIMAL(5,1) DEFAULT 0,
  copilot_time DECIMAL(5,1) DEFAULT 0,
  instructor_time DECIMAL(5,1) DEFAULT 0,
  evaluator_time DECIMAL(5,1) DEFAULT 0,
  night_time DECIMAL(5,1) DEFAULT 0,
  nvg_time DECIMAL(5,1) DEFAULT 0,
  instrument_time DECIMAL(5,1) DEFAULT 0,
  sim_instrument_time DECIMAL(5,1) DEFAULT 0,

  -- FAA compatible
  pic_time DECIMAL(5,1) DEFAULT 0,
  sic_time DECIMAL(5,1) DEFAULT 0,
  xc_time DECIMAL(5,1) DEFAULT 0,
  solo_time DECIMAL(5,1) DEFAULT 0,
  dual_received_time DECIMAL(5,1) DEFAULT 0,

  -- Landings
  day_landings INTEGER DEFAULT 0,
  night_landings INTEGER DEFAULT 0,
  nvg_landings INTEGER DEFAULT 0,
  full_stop_landings INTEGER DEFAULT 0,
  touch_and_go_landings INTEGER DEFAULT 0,
  carrier_traps INTEGER DEFAULT 0,
  carrier_bolters INTEGER DEFAULT 0,

  -- Approaches
  approaches JSONB DEFAULT '[]'::jsonb, -- [{type, runway, airport}]

  -- Mission specific
  formation_position TEXT,       -- lead, wing2, wing3, wing4
  formation_type TEXT,           -- 2-ship, 4-ship, etc.
  weapons_events JSONB DEFAULT '[]'::jsonb,
  air_refueling_type TEXT,       -- boom, drogue, both
  air_refueling_contacts INTEGER DEFAULT 0,
  airdrop_events JSONB DEFAULT '[]'::jsonb,
  low_level_time DECIMAL(5,1) DEFAULT 0,
  low_level_type TEXT,
  combat_time DECIMAL(5,1) DEFAULT 0,
  combat_sorties INTEGER DEFAULT 0,

  -- Simulator
  is_simulator BOOLEAN DEFAULT false,
  simulator_type TEXT,

  -- Offline sync
  is_synced BOOLEAN DEFAULT true,
  local_id TEXT,                 -- client UUID for dedup

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER trg_flights_updated_at
  BEFORE UPDATE ON flights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

CREATE POLICY flights_select_own ON flights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY flights_insert_own ON flights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY flights_update_own ON flights
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY flights_delete_own ON flights
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_flights_user_date ON flights (user_id, flight_date DESC);
CREATE INDEX idx_flights_user_aircraft ON flights (user_id, aircraft_type_id);

-- Unique constraint for offline dedup (partial index: only when local_id is set)
CREATE UNIQUE INDEX uq_flights_user_local_id
  ON flights (user_id, local_id)
  WHERE local_id IS NOT NULL;
