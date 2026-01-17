-- Migration 0004: Secure Realtime with RLS
-- This migration adds user isolation, secure RLS policies, and enables Realtime
-- 
-- Security: This fixes the critical vulnerability where all users can see all messages
-- After this migration, users can ONLY see their own messages

-- ====================================================================
-- STEP 1: Add user_id column to whatsapp_messages
-- ====================================================================
-- This links each message to the user who owns it
-- NOTE: Using TEXT type to match whatsapp_accounts.user_id type
ALTER TABLE whatsapp_messages 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add foreign key constraint (user_id references users table which has UUID id)
-- But whatsapp_accounts.user_id is TEXT, so we reference that
-- The proper fix would be to make whatsapp_accounts.user_id a UUID too, but
-- for now we'll keep them as TEXT for consistency
-- Comment out the foreign key for now since it would require type alignment
-- ALTER TABLE whatsapp_messages
-- ADD CONSTRAINT fk_whatsapp_messages_user 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index for performance (critical for RLS filtering)
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id 
ON whatsapp_messages(user_id);

-- ====================================================================
-- STEP 2: Backfill existing messages with user_id
-- ====================================================================
-- This ensures existing data is accessible after we enable RLS
-- Links messages to users via whatsapp_accounts table
UPDATE whatsapp_messages wm
SET user_id = wa.user_id
FROM whatsapp_accounts wa
WHERE wm.phone_number_id = wa.phone_number_id
  AND wm.user_id IS NULL;

-- ====================================================================
-- STEP 3: Make user_id required for new messages
-- ====================================================================
-- Prevents any messages from being created without a user
ALTER TABLE whatsapp_messages 
ALTER COLUMN user_id SET NOT NULL;

-- ====================================================================
-- STEP 4: DROP INSECURE RLS POLICY
-- ====================================================================
-- This is the CRITICAL SECURITY FIX
-- Old policy: USING (true) - allowed anyone to see everything!
DROP POLICY IF EXISTS "Allow all operations on whatsapp_messages" ON whatsapp_messages;

-- ====================================================================
-- STEP 5: CREATE SECURE RLS POLICY
-- ====================================================================
-- This policy enforces user isolation at the DATABASE level
-- Users can ONLY access messages where user_id = auth.uid()
-- Even if someone hacks the frontend, they can't bypass this
-- NOTE: auth.uid() returns UUID, but user_id is TEXT, so we cast to TEXT
CREATE POLICY "Users can only access their own messages"
ON whatsapp_messages
FOR ALL
USING (user_id = auth.uid()::text)        -- Cast UUID to TEXT
WITH CHECK (user_id = auth.uid()::text);  -- Cast UUID to TEXT

-- ====================================================================
-- STEP 6: Secure whatsapp_accounts table too
-- ====================================================================
-- Drop insecure policy if exists
DROP POLICY IF EXISTS "Allow all operations on whatsapp_accounts" ON whatsapp_accounts;

-- Create secure policy
-- NOTE: Same casting issue - user_id is TEXT, auth.uid() is UUID
CREATE POLICY "Users can only access their own accounts"
ON whatsapp_accounts
FOR ALL
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- ====================================================================
-- STEP 7: Enable Realtime Replication
-- ====================================================================
-- This allows frontend to subscribe to real-time database changes
-- Realtime automatically respects RLS policies - users only receive
-- updates for rows they can access!
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;

-- ====================================================================
-- VERIFICATION QUERIES (Run these to test)
-- ====================================================================
-- After migration, run these to verify security:
--
-- 1. Check user_id is populated:
-- SELECT id, user_id, from_number, message_text FROM whatsapp_messages LIMIT 5;
--
-- 2. Test RLS (should only return YOUR messages):
-- SELECT COUNT(*) FROM whatsapp_messages;
--
-- 3. Check Realtime is enabled:
-- SELECT schemaname, tablename FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime';
