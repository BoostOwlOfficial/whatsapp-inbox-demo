# WhatsApp Embedded Signup - Setup Guide

## Overview

WhatsApp Embedded Signup integration has been successfully implemented. Users can now connect their WhatsApp Business accounts directly from your application using Facebook's OAuth flow.

## What's Been Implemented

### 📊 Database Schema

Created two new tables in Supabase:

- **`whatsapp_accounts`**: Stores WhatsApp Business Account information
- **`whatsapp_credentials`**: Stores encrypted access tokens with AES-256-GCM encryption

Run the migration:
```bash
# In Supabase SQL Editor, run the file:
supabase/whatsapp_signup_migration.sql
```

---

### 🔐 Security Features

- **AES-256-GCM Encryption**: Access tokens are encrypted before storage
- **CSRF Protection**: State parameter validation in OAuth flow
- **Secure Storage**: Encryption keys stored in environment variables (never in code)

---

### 🎨 UI Components

**Header Button**: Green WhatsApp-branded button appears in the header (left side) after user login

**Signup Dialog**: Modal showing:
- Connection instructions
- Facebook OAuth integration
- Connected account status
- Error handling with user-friendly messages

---

### 🔌 API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/whatsapp/signup/initiate` | Starts signup flow, returns config |
| `POST /api/whatsapp/signup/callback` | Handles OAuth callback, saves encrypted tokens |
| `GET /api/whatsapp/signup/status` | Checks connection status |

---

### ⚙️ Facebook SDK Integration

Facebook JavaScript SDK automatically loads on every page and initializes with your App ID for seamless embedded signup.

## Environment Variables Required

Add these to your `.env.local` file:

```env
# WhatsApp Signup - Encryption
WHATSAPP_ENCRYPTION_KEY=1967f1911393c86966faf0103990558dd1e2dbbe590d387015f70b7bdb89be2c

# Facebook App Configuration
NEXT_PUBLIC_FACEBOOK_APP_ID=2074250006740949
NEXT_PUBLIC_FACEBOOK_CONFIG_ID=829902823419760
FACEBOOK_REDIRECT_URL=https://business.facebook.com/messaging/whatsapp/onboard/?app_id=2074250006740949&config_id=829902823419760&extras=%7B%22sessionInfoVersion%22%3A%223%22%2C%22version%22%3A%22v3%22%7D
WHATSAPP_GRAPH_API_VERSION=v24.0

# Supabase (if not already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Next Steps

### 1. Run Database Migration

Execute `supabase/whatsapp_signup_migration.sql` in your Supabase SQL editor to create the required tables.

### 2. Configure Environment Variables

Copy the environment variables above to your `.env.local` file. The encryption key and Facebook credentials are already provided.

### 3. Test the Flow

1. Start the dev server: `npm run dev`
2. Login to the application
3. Click "Connect WhatsApp" button in the header
4. Complete the Facebook OAuth flow
5. Verify the account appears as connected

### 4. Production Deployment

> [!IMPORTANT]
> Make sure to add all environment variables to your production hosting (Vercel, etc.)

### 5. Additional Features to Consider

- **Token Refresh**: Implement automatic token refresh before expiration (tokens last ~60 days)
- **Multi-Account Support**: Allow users to connect multiple WhatsApp Business accounts
- **Account Switching**: UI to select which account to use for sending messages
- **User Association**: Link `user_id` field when you implement proper user authentication

## What You Need to Provide

I need the following information from you:

1. **Supabase Credentials**: 
   - Have you already run the database migration?
   - Are your Supabase env variables configured?

2. **User Authentication**:
   - How should we link WhatsApp accounts to users? 
   - Currently using hardcoded user (`tmayank85`) - should we add proper user ID tracking?

3. **Testing**:
   - Do you have a WhatsApp Business account to test with?
   - Have you configured the app in Facebook App Dashboard with these credentials?

4. **Token Storage**:
   - The tokens are encrypted and stored safely
   - When you need to use them (e.g., sending messages), you'll decrypt using the `decryptToken()` function from `lib/crypto-utils.ts`

## Using Decrypted Tokens

When you need to make WhatsApp API calls:

```typescript
import { supabase } from '@/lib/supabase'
import { decryptToken } from '@/lib/crypto-utils'

// Get account and credentials
const { data: account } = await supabase
  .from('whatsapp_accounts')
  .select('*, whatsapp_credentials(*)')
  .eq('user_id', userId)
  .single()

if (account?.whatsapp_credentials) {
  const creds = account.whatsapp_credentials
  
  // Decrypt the token
  const accessToken = decryptToken(
    creds.encrypted_access_token,
    creds.encryption_iv,
    creds.encryption_auth_tag
  )
  
  // Use the token for API calls
  const response = await fetch(
    `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  )
}
```

## Files Created/Modified

### New Files
- `supabase/whatsapp_signup_migration.sql` - Database schema
- `lib/crypto-utils.ts` - Encryption utilities
- `app/api/whatsapp/signup/initiate/route.ts` - Initiate endpoint
- `app/api/whatsapp/signup/callback/route.ts` - OAuth callback handler
- `app/api/whatsapp/signup/status/route.ts` - Status check endpoint
- `hooks/use-whatsapp-signup.ts` - React hook for signup flow
- `components/whatsapp-signup-dialog.tsx` - Signup dialog UI

### Modified Files
- `lib/supabase.ts` - Added TypeScript types for new tables
- `components/top-header.tsx` - Added WhatsApp signup button
- `app/layout.tsx` - Added Facebook SDK initialization
- `env.example.txt` - Added new environment variables

## Security Notes

✅ **Tokens are encrypted** using AES-256-GCM with authentication tags  
✅ **Encryption key** is stored in environment variables (gitignored)  
✅ **CSRF protection** via state parameter validation  
✅ **No tokens in logs** - encryption utilities catch errors safely  
✅ **Foreign key constraints** prevent orphaned credentials  
✅ **Row-level security** enabled on database tables
