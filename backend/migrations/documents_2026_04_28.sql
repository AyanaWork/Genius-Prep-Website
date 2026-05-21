-- =====================================================================
-- Documents Library (2026-04-28) — self-contained
-- =====================================================================
-- Past papers, notes, memos uploaded by students. Access is gated by
-- a "give-to-get" rule: a student must have at least 1 approved upload
-- of their own before they can see other students' documents.
--
-- Files themselves live in Supabase Storage (bucket: 'documents').
-- This table only tracks metadata + storage path.
--
-- Run this in the Supabase SQL editor. Safe to run multiple times.
-- =====================================================================

-- pg_trgm enables GIN indexes for fuzzy / partial title search.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    uploader_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    doc_type VARCHAR(20) NOT NULL
        CHECK (doc_type IN ('past_paper', 'notes', 'memo', 'tutorial', 'other')),
    subject VARCHAR(255),
    module_code VARCHAR(50),
    institution VARCHAR(255),
    year INTEGER,
    semester VARCHAR(20),

    title VARCHAR(255) NOT NULL,
    description TEXT,

    storage_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,

    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    moderated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    moderated_at TIMESTAMP,

    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_uploader ON documents(uploader_user_id);
CREATE INDEX IF NOT EXISTS idx_documents_module_code ON documents(module_code);
CREATE INDEX IF NOT EXISTS idx_documents_type_status ON documents(doc_type, status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_title_trgm
  ON documents USING GIN (title gin_trgm_ops);
