-- =====================================================================
-- Add requester_user_id to tutor_requests so logged-in students can
-- track their own submissions. Run after enhancements_2026_04_28.sql.
-- =====================================================================

ALTER TABLE tutor_requests
  ADD COLUMN IF NOT EXISTS requester_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tutor_requests_requester_user
  ON tutor_requests(requester_user_id);
