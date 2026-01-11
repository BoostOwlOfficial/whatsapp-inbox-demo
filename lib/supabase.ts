import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Message storage will not work.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
