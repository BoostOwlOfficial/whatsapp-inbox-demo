# Database Migration Instructions

## 📋 Prerequisites
- Access to your Supabase project dashboard

## 🚀 Steps to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**
   - Go to your Supabase project: https://supabase.com/dashboard
   - Click on "SQL Editor" in the left sidebar

2. **Run the Migration Script**
   - Copy the entire content from `supabase/migrations/add_direction_column.sql`
   - **No phone number needed!** The script uses the `metadata` field to determine message direction
   
3. **Execute the Script**
   - Paste the script into the SQL Editor
   - Click "Run" to execute the migration
   - Wait for confirmation that all steps completed successfully

4. **Verify the Migration**
   - Run this query to check the results:
   ```sql
   SELECT direction, COUNT(*) as count FROM whatsapp_messages GROUP BY direction;
   ```
   - You should see counts for both 'inbound' and 'outbound'

### How It Works

The migration automatically detects message direction using the `metadata` field:
- **Outbound messages**: Have `metadata->>'sent_via' = 'api'` (sent by you via the send-message API)
- **Inbound messages**: Don't have this field (received via webhook from customers)

### Option 2: For New/Empty Tables

If you have a fresh install or don't have existing messages:

1. **Recreate the Table**
   - Simply run the updated `supabase/schema.sql` file
   - This will create the table with the `direction` column included

2. **Drop and Recreate** (if you want to start fresh)
   ```sql
   DROP TABLE IF EXISTS whatsapp_messages;
   ```
   - Then run the full `supabase/schema.sql`

## ⚠️ Important Notes

- **Backup First**: Always backup your data before running migrations
- **Test Connection**: Ensure your Supabase connection is working
- **Automatic Detection**: No manual configuration needed - the script auto-detects message direction

## 🔍 Troubleshooting

### If you see an error about NOT NULL constraint:
- Some messages may not have been updated
- Check for NULL values: `SELECT * FROM whatsapp_messages WHERE direction IS NULL;`
- If found, manually set direction:
  ```sql
  -- For any remaining NULL values, default to inbound
  UPDATE whatsapp_messages SET direction = 'inbound' WHERE direction IS NULL;
  ```

### If migration fails partway through:
- The script is designed to be idempotent (safe to run multiple times)
- Simply fix the issue and run the script again

## ✅ After Migration

Once the migration is complete:
1. Refresh your inbox page
2. Send a test message
3. Verify messages appear on the correct side (sent messages on right, received on left)
4. Check that the conversation view works properly
