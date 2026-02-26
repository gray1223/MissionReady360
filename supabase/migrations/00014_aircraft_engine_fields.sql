-- Add engine metadata to aircraft_types
CREATE TYPE engine_type AS ENUM ('piston', 'turboprop', 'turboshaft', 'turbojet', 'turbofan');

ALTER TABLE aircraft_types
  ADD COLUMN engine_count INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN engine_type engine_type;

-- USAF
UPDATE aircraft_types SET engine_count = 1, engine_type = 'turbojet'  WHERE designation = 'F-16C';
UPDATE aircraft_types SET engine_count = 2, engine_type = 'turbojet'  WHERE designation = 'F-15E';
UPDATE aircraft_types SET engine_count = 1, engine_type = 'turbojet'  WHERE designation = 'F-35A';
UPDATE aircraft_types SET engine_count = 4, engine_type = 'turbofan'  WHERE designation = 'C-17A';
UPDATE aircraft_types SET engine_count = 4, engine_type = 'turboprop' WHERE designation = 'C-130J';
UPDATE aircraft_types SET engine_count = 4, engine_type = 'turbofan'  WHERE designation = 'KC-135R';
UPDATE aircraft_types SET engine_count = 2, engine_type = 'turbofan'  WHERE designation = 'KC-46A';
UPDATE aircraft_types SET engine_count = 4, engine_type = 'turbofan'  WHERE designation = 'B-1B';
UPDATE aircraft_types SET engine_count = 1, engine_type = 'turboprop' WHERE designation = 'T-6A';
UPDATE aircraft_types SET engine_count = 2, engine_type = 'turbojet'  WHERE designation = 'T-38C';

-- USN
UPDATE aircraft_types SET engine_count = 2, engine_type = 'turbofan'  WHERE designation = 'FA-18E';
UPDATE aircraft_types SET engine_count = 2, engine_type = 'turbofan'  WHERE designation = 'FA-18F';
UPDATE aircraft_types SET engine_count = 2, engine_type = 'turboprop' WHERE designation = 'E-2D';
UPDATE aircraft_types SET engine_count = 2, engine_type = 'turbofan'  WHERE designation = 'P-8A';
UPDATE aircraft_types SET engine_count = 1, engine_type = 'turbojet'  WHERE designation = 'T-45C';
UPDATE aircraft_types SET engine_count = 2, engine_type = 'turboprop' WHERE designation = 'C-2A';

-- USMC
UPDATE aircraft_types SET engine_count = 2, engine_type = 'turboshaft' WHERE designation = 'MV-22B';
UPDATE aircraft_types SET engine_count = 1, engine_type = 'turbojet'  WHERE designation = 'AV-8B';
UPDATE aircraft_types SET engine_count = 3, engine_type = 'turboshaft' WHERE designation = 'CH-53E';

-- USA
UPDATE aircraft_types SET engine_count = 2, engine_type = 'turboshaft' WHERE designation = 'UH-60M';
UPDATE aircraft_types SET engine_count = 2, engine_type = 'turboshaft' WHERE designation = 'AH-64E';
UPDATE aircraft_types SET engine_count = 2, engine_type = 'turboshaft' WHERE designation = 'CH-47F';

-- Civilian
UPDATE aircraft_types SET engine_count = 1, engine_type = 'piston'    WHERE designation = 'C172';
UPDATE aircraft_types SET engine_count = 1, engine_type = 'piston'    WHERE designation = 'PA-28';
UPDATE aircraft_types SET engine_count = 2, engine_type = 'turboprop' WHERE designation = 'BE-C90';
