import { createClient } from '@supabase/supabase-js'

// Supabase configuration with fallbacks for build time
// Vercel and other serverless platforms may not have env vars during build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

// Create Supabase client (safe for build time)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to check if Supabase is properly configured at runtime
export function isSupabaseConfigured(): boolean {
    return (
        process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== '' &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== ''
    )
}

// TypeScript types for database schema
export interface WhatsAppMessage {
    id: string
    phone_number_id: string
    from_number: string
    to_number: string | null
    contact_name: string | null
    message_type: string
    message_text: string | null
    timestamp: number
    status: 'received' | 'sent' | 'delivered' | 'read' | 'failed'
    metadata: Record<string, any> | null
    created_at?: string
}

export interface MessageInsert {
    id: string
    phone_number_id: string
    from_number: string
    to_number?: string | null
    contact_name?: string | null
    message_type: string
    message_text?: string | null
    timestamp: number
    status?: 'received' | 'sent' | 'delivered' | 'read' | 'failed'
    metadata?: Record<string, any> | null
}

// WhatsApp Account Types
export interface WhatsAppAccount {
    id: string
    user_id: string | null
    business_account_id: string
    waba_id: string
    phone_number_id: string
    phone_number: string | null
    display_name: string | null
    quality_rating: string | null
    is_active: boolean
    connected_at: string
    last_synced_at: string
    created_at: string
    updated_at: string
}

export interface WhatsAppAccountInsert {
    user_id?: string | null
    business_account_id: string
    waba_id: string
    phone_number_id: string
    phone_number?: string | null
    display_name?: string | null
    quality_rating?: string | null
    is_active?: boolean
}

export interface WhatsAppCredential {
    id: string
    account_id: string
    encrypted_access_token: string
    token_expires_at: string | null
    encrypted_refresh_token: string | null
    encryption_iv: string
    encryption_auth_tag: string
    created_at: string
    updated_at: string
}

export interface WhatsAppCredentialInsert {
    account_id: string
    encrypted_access_token: string
    token_expires_at?: string | null
    encrypted_refresh_token?: string | null
    encryption_iv: string
    encryption_auth_tag: string
}
