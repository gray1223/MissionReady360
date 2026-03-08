-- Backfill existing debrief_items with "status": "open"
-- The debrief_items column stores JSONB array of objects.
-- Each object gets a new optional "status" field: "open" | "in_progress" | "resolved"

UPDATE flights
SET debrief_items = (
  SELECT jsonb_agg(
    CASE
      WHEN item ? 'status' THEN item
      ELSE item || '{"status": "open"}'::jsonb
    END
  )
  FROM jsonb_array_elements(debrief_items) AS item
)
WHERE jsonb_array_length(debrief_items) > 0;

COMMENT ON COLUMN flights.debrief_items IS 'Array of {category, item, resolution, status} objects. status: open | in_progress | resolved';
