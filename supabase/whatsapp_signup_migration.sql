-- WhatsApp Accounts Table
-- Stores information about connected WhatsApp Business Accounts
CREATE TABLE IF NOT EXISTS whatsapp_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  business_account_id TEXT NOT NULL,
  waba_id TEXT NOT NULL,
  phone_number_id TEXT NOT NULL,
  phone_number TEXT,
  display_name TEXT,
  quality_rating TEXT,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp Credentials Table
-- Stores encrypted access tokens and related security information
CREATE TABLE IF NOT EXISTS whatsapp_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES whatsapp_accounts(id) ON DELETE CASCADE,
  encrypted_access_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  encrypted_refresh_token TEXT,
  encryption_iv TEXT NOT NULL,
  encryption_auth_tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_user_id ON whatsapp_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_waba_id ON whatsapp_accounts(waba_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_phone_number_id ON whatsapp_accounts(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_is_active ON whatsapp_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_credentials_account_id ON whatsapp_credentials(account_id);

-- Enable Row Level Security (RLS)
ALTER TABLE whatsapp_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your security requirements)
CREATE POLICY "Allow all operations on whatsapp_accounts" ON whatsapp_accounts
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on whatsapp_credentials" ON whatsapp_credentials
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note: In production, you should create more restrictive policies based on your authentication setup
-- Example: Only allow users to see their own accounts
-- CREATE POLICY "Users can view own accounts" ON whatsapp_accounts
--   FOR SELECT
--   USING (user_id = current_setting('app.current_user_id')::text);
