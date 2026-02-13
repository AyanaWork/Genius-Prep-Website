-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_recipient ON chat_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(sender_id, recipient_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(recipient_id, is_read) WHERE is_read = FALSE;

-- triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_messages_updated_at
BEFORE UPDATE ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_messages_updated_at();