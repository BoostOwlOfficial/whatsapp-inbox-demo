-- Migration Script: Add direction column to whatsapp_messages table
-- This script handles adding the column to existing tables with data

-- Step 1: Add the direction column as nullable first (to allow existing rows)
ALTER TABLE whatsapp_messages 
ADD COLUMN IF NOT EXISTS direction TEXT;

-- Step 2: Backfill existing messages using metadata
-- Outbound messages have metadata->>'sent_via' = 'api' (sent by us via the send-message API)
-- Inbound messages don't have this field (received via webhook from customers)

UPDATE whatsapp_messages 
SET direction = 'outbound' 
WHERE direction IS NULL 
  AND metadata->>'sent_via' = 'api';

UPDATE whatsapp_messages 
SET direction = 'inbound' 
WHERE direction IS NULL 
  AND (metadata->>'sent_via' IS NULL OR metadata->>'sent_via' != 'api');

-- Step 3: Add NOT NULL constraint after backfilling
ALTER TABLE whatsapp_messages 
ALTER COLUMN direction SET NOT NULL;

-- Step 4: Add CHECK constraint
ALTER TABLE whatsapp_messages
ADD CONSTRAINT check_direction CHECK (direction IN ('inbound', 'outbound'));

-- Step 5: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_direction ON whatsapp_messages(direction);

-- Verify the migration
-- Run this query to check the results:
-- SELECT direction, COUNT(*) as count FROM whatsapp_messages GROUP BY direction;
