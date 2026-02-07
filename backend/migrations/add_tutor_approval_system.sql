-- Add approval columns to tutor_profiles table
ALTER TABLE tutor_profiles 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create tutor_documents table
CREATE TABLE IF NOT EXISTS tutor_documents (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'id_document' or 'academic_transcript'
  document_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tutor_id, document_type) -- Each tutor can only have one of each document type
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_approval_status ON tutor_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_tutor_documents_tutor_id ON tutor_documents(tutor_id);

-- Update existing tutors to 'approved' status (so they don't get hidden)
UPDATE tutor_profiles SET approval_status = 'approved' WHERE approval_status IS NULL;