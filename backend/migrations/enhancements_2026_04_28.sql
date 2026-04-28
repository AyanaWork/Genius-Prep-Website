-- =====================================================================
-- Genius Prep Enhancements Migration (2026-04-28)
-- =====================================================================
-- Covers:
--   Feature 1: Module-code search performance (GIN indexes)
--   Feature 2: Phone numbers (admin-only) on profile tables
--   Feature 3: Tutor request system (public form for students/bursaries)
--   Broader:   Audit log, favorites, recently_viewed, request status enum
-- =====================================================================

-- ----------------------------------------------------------------------
-- FEATURE 2: Phone numbers
-- Stored on the profile tables (not users) so unauthenticated requesters
-- via the request-a-tutor form can also be reached.
-- ----------------------------------------------------------------------
ALTER TABLE tutor_profiles
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_tutor_profiles_phone
  ON tutor_profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_student_profiles_phone
  ON student_profiles(phone_number);

-- ----------------------------------------------------------------------
-- FEATURE 1: Search performance
-- GIN indexes on array columns power fast ANY() and overlap queries
-- which is what `module_codes` / `subjects` filtering uses.
-- ----------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_subjects
  ON tutor_profiles USING GIN (subjects);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_module_codes
  ON tutor_profiles USING GIN (module_codes);

-- Trigram extension lets us do fast partial / fuzzy matches
-- on display_name and free-text fields. Safe to call IF NOT EXISTS.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_tutor_profiles_display_name_trgm
  ON tutor_profiles USING GIN (display_name gin_trgm_ops);

-- ----------------------------------------------------------------------
-- FEATURE 3: tutor_requests table
-- Used by the public "Request a Tutor" form (students, bursaries, parents).
-- No auth required to insert; only admins can read/update.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tutor_requests (
    id SERIAL PRIMARY KEY,
    requester_type VARCHAR(20) NOT NULL
        CHECK (requester_type IN ('student', 'bursary', 'parent')),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    organisation VARCHAR(255),                  -- bursary or company name
    education_level VARCHAR(100),
    institution VARCHAR(255),                   -- e.g. UP, UCT
    subjects TEXT[] DEFAULT ARRAY[]::TEXT[],
    module_codes TEXT[] DEFAULT ARRAY[]::TEXT[],
    budget_per_hour DECIMAL(10, 2),
    preferred_format VARCHAR(20)
        CHECK (preferred_format IN ('online', 'in-person', 'hybrid')),
    location VARCHAR(255),
    number_of_students INTEGER DEFAULT 1,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'new'
        CHECK (status IN ('new', 'reviewing', 'matched', 'contacted', 'closed')),
    matched_tutor_ids INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tutor_requests_status
  ON tutor_requests(status);
CREATE INDEX IF NOT EXISTS idx_tutor_requests_created_at
  ON tutor_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutor_requests_subjects
  ON tutor_requests USING GIN (subjects);
CREATE INDEX IF NOT EXISTS idx_tutor_requests_module_codes
  ON tutor_requests USING GIN (module_codes);

-- ----------------------------------------------------------------------
-- BROADER: admin_audit_log
-- Tracks sensitive admin actions (who viewed phone numbers, approvals,
-- etc.). Useful for compliance and debugging.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,            -- e.g. 'viewed_contact', 'approved_tutor'
    target_type VARCHAR(32),                -- 'tutor', 'student', 'request'
    target_id INTEGER,
    metadata JSONB,
    ip_address VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin
  ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target
  ON admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at
  ON admin_audit_log(created_at DESC);

-- ----------------------------------------------------------------------
-- BROADER: student favorites + recently_viewed
-- Powers "Save tutor" hearts and "Recently viewed" widget on the
-- student dashboard. Both are scoped to a student.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tutor_favorites (
    id SERIAL PRIMARY KEY,
    student_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tutor_id INTEGER REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_user_id, tutor_id)
);

CREATE INDEX IF NOT EXISTS idx_tutor_favorites_student
  ON tutor_favorites(student_user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_favorites_tutor
  ON tutor_favorites(tutor_id);

CREATE TABLE IF NOT EXISTS recently_viewed_tutors (
    id SERIAL PRIMARY KEY,
    student_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tutor_id INTEGER REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_user_id, tutor_id)
);

CREATE INDEX IF NOT EXISTS idx_recently_viewed_student
  ON recently_viewed_tutors(student_user_id, viewed_at DESC);

