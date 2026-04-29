-- 00024_drop_boldface_progress.sql
-- Boldface drilling feature was removed. Drop the progress table along
-- with its trigger and function.

DROP TRIGGER IF EXISTS trg_boldface_progress_updated_at ON boldface_progress;
DROP FUNCTION IF EXISTS boldface_progress_set_updated_at();
DROP TABLE IF EXISTS boldface_progress;
