-- 00011_indexes.sql
-- Additional performance indexes
-- Note: Some indexes on flights were already created in 00005_flights.sql
--   idx_flights_user_date (user_id, flight_date DESC)
--   idx_flights_user_aircraft (user_id, aircraft_type_id)

-- Currency rules lookup by branch and aircraft type
CREATE INDEX idx_currency_rules_branch_aircraft
  ON currency_rules (branch, aircraft_type_id);

-- User currency overrides lookup by user
CREATE INDEX idx_user_currency_overrides_user
  ON user_currency_overrides (user_id);

-- User qualifications lookup by user
CREATE INDEX idx_user_qualifications_user
  ON user_qualifications (user_id);

-- Audit log lookup by user and time
CREATE INDEX idx_audit_log_user_created
  ON audit_log (user_id, created_at DESC);
