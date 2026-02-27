-- Add debrief_items JSONB column to flights for tracking debrief discussion items
ALTER TABLE flights
  ADD COLUMN debrief_items JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN flights.debrief_items IS 'Array of {category, item, resolution} debrief discussion items';
