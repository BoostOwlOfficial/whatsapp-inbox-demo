-- AI Auto-Reply Feature Database Migration
-- Creates necessary tables and columns for AI-powered auto-reply functionality

-- Add AI auto-reply flag to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS use_ai_to_reply BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create AI responses table for managing predefined responses
CREATE TABLE IF NOT EXISTS ai_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  keywords JSONB, -- Optional: Store keywords to help with matching
  category TEXT, -- Optional: Categorize responses (e.g., 'greeting', 'pricing', 'support')
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_ai_responses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_responses_user_id ON ai_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_active ON ai_responses(user_id, is_active);

-- Add audit logging for AI replies
CREATE TABLE IF NOT EXISTS ai_reply_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL, -- WhatsApp message ID
  user_message TEXT NOT NULL,
  selected_response_id UUID REFERENCES ai_responses(id) ON DELETE SET NULL,
  selected_response_text TEXT NOT NULL,
  confidence_score DECIMAL(5,2) NOT NULL,
  was_sent BOOLEAN DEFAULT false,
  grok_api_response JSONB, -- Store raw Grok response for debugging
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_reply_logs_user_id ON ai_reply_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_reply_logs_message_id ON ai_reply_logs(message_id);

-- Add comment for documentation
COMMENT ON TABLE ai_responses IS 'Stores predefined responses for AI auto-reply feature';
COMMENT ON TABLE ai_reply_logs IS 'Audit log of all AI auto-reply interactions';
COMMENT ON COLUMN users.use_ai_to_reply IS 'Flag to enable/disable AI auto-reply feature for user';
