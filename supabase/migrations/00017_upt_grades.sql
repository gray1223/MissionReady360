-- Add UPT (Undergraduate Pilot Training) grade tracking
ALTER TABLE flights ADD COLUMN upt_grades JSONB DEFAULT NULL;
