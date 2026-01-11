-- WhatsApp Messages Table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id TEXT PRIMARY KEY,
  phone_number_id TEXT NOT NULL,
  from_number TEXT NOT NULL,
  to_number TEXT,
  contact_name TEXT,
  message_type TEXT NOT NULL,
  message_text TEXT,
  timestamp BIGINT NOT NULL,
  status TEXT DEFAULT 'received',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_phone_number_id ON whatsapp_messages(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_from_number ON whatsapp_messages(from_number);
CREATE INDEX IF NOT EXISTS idx_to_number ON whatsapp_messages(to_number);
CREATE INDEX IF NOT EXISTS idx_timestamp ON whatsapp_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_created_at ON whatsapp_messages(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security requirements)
CREATE POLICY "Allow all operations on whatsapp_messages" ON whatsapp_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note: In production, you should create more restrictive policies based on your authentication setup
