-- GPA Chat History Table
CREATE TABLE IF NOT EXISTS gpa_chats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) DEFAULT 'New Chat',
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, conversation_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_gpa_chats_user_id ON gpa_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_gpa_chats_conversation_id ON gpa_chats(conversation_id);
CREATE INDEX IF NOT EXISTS idx_gpa_chats_created_at ON gpa_chats(created_at DESC);

-- Update trigger
CREATE OR REPLACE FUNCTION update_gpa_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gpa_chats_updated_at
BEFORE UPDATE ON gpa_chats
FOR EACH ROW
EXECUTE FUNCTION update_gpa_chats_updated_at();