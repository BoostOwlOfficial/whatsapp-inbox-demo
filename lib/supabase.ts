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
