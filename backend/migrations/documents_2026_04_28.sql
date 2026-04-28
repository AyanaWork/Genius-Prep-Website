-- =====================================================================
-- Documents Library (2026-04-28)
-- =====================================================================
-- Past papers, notes, memos uploaded by students. Access is gated by
-- a "give-to-get" rule: a student must have at least 1 approved upload
-- of their own before they can see other students' documents.
--
-- Files themselves live in Supabase storage (bucket: 'documents').
-- This table only tracks metadata + storage path.
-- =====================================================================

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    uploader_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Classification
    doc_type VARCHAR(20) NOT NULL
        CHECK (doc_type IN ('past_paper', 'notes', 'memo', 'tutorial', 'other')),
    subject VARCHAR(255),
    module_code VARCHAR(50),
    institution VARCHAR(255),                  -- e.g. UP, UCT
    year INTEGER,                               -- exam year for past papers
    semester VARCHAR(20),                       -- 'S1', 'S2', 'Mid-year', etc.

    -- Display
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- File metadata
    storage_path TEXT NOT NULL,                 -- path inside Supabase bucket
    file_url TEXT NOT NULL,                     -- public/signed URL for preview
    mime_type VARCHAR(100),
    file_size BIGINT,                           -- bytes

    -- Moderation
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    moderated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    moderated_at TIMESTAMP,

    -- Counters (for popularity sorting later)
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hot lookup paths
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_uploader ON documents(uploader_user_id);
CREATE INDEX IF NOT EXISTS idx_documents_module_code ON documents(module_code);
CREATE INDEX IF NOT EXISTS idx_documents_type_status ON documents(doc_type, status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Trigram on title for fast partial search.
CREATE INDEX IF NOT EXISTS idx_documents_title_trgm
  ON documents USING GIN (title gin_trgm_ops);

-- =====================================================================
-- Notes for ops
-- =====================================================================
-- 1) Create a Supabase storage bucket called "documents".
--    In Supabase dashboard → Storage → New bucket → name "documents".
--    Set it to PRIVATE (not public). The backend will generate signed
--    URLs that expire after a short time so direct sharing is harder.
--
-- 2) The backend uses the SUPABASE_SERVICE_ROLE_KEY to upload/sign,
--    so make sure that's set in .env.
--
-- 3) "Give-to-get" gate: see backend/controllers/documentController.js,
--    function `userIsUnlocked()`. Default rule is "≥ 1 approved upload".
--    Tune by editing the threshold there.
-- =====================================================================
