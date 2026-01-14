import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/whatsapp/signup/status
 * Checks if the current user has connected a WhatsApp account
 */
export async function GET(request: NextRequest) {
    try {
        // Get user ID from auth
        // In production, extract from your auth system
        const userId = request.headers.get('x-user-id') || null

        if (!userId) {
            return NextResponse.json({
                success: true,
                connected: false,
                account: null,
            })
        }

        // Query for active WhatsApp accounts
        const { data: accounts, error } = await supabase
            .from('whatsapp_accounts')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('connected_at', { ascending: false })
            .limit(1)

        if (error) {
            console.error('Error fetching account status:', error)
            throw new Error('Failed to check account status')
        }

        if (!accounts || accounts.length === 0) {
            return NextResponse.json({
                success: true,
                connected: false,
                account: null,
            })
        }

        const account = accounts[0]

        return NextResponse.json({
            success: true,
            connected: true,
            account: {
                id: account.id,
                phone_number: account.phone_number,
                display_name: account.display_name,
                quality_rating: account.quality_rating,
                connected_at: account.connected_at,
            },
        })
    } catch (error) {
        console.error('Error checking signup status:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to check status'
            },
            { status: 500 }
        )
    }
}
