-- Add direction column to whatsapp_messages table
-- This migration adds an explicit 'direction' field to reliably identify
-- whether a message is inbound (received) or outbound (sent)

-- Step 1: Add the direction column
ALTER TABLE whatsapp_messages 
ADD COLUMN IF NOT EXISTS direction VARCHAR(10) 
CHECK (direction IN ('inbound', 'outbound'));

-- Step 2: Update existing messages based on status
-- Messages with status 'sent', 'delivered', 'read' are outbound
-- Messages with status 'received', 'failed' are inbound
UPDATE whatsapp_messages 
SET direction = CASE 
  WHEN status IN ('sent', 'delivered', 'read') THEN 'outbound'
  ELSE 'inbound'
END
WHERE direction IS NULL;

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_direction ON whatsapp_messages(direction);

-- Step 4: Make direction NOT NULL after backfilling
ALTER TABLE whatsapp_messages 
ALTER COLUMN direction SET NOT NULL;

COMMENT ON COLUMN whatsapp_messages.direction IS 'Message direction: inbound (received) or outbound (sent)';
