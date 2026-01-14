import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { encryptToken } from '@/lib/crypto-utils'
import type { WhatsAppAccountInsert, WhatsAppCredentialInsert } from '@/lib/supabase'

interface FacebookCallbackData {
    code: string
    state?: string
}

interface WhatsAppBusinessAccount {
    id: string
    name: string
    timezone_id: string
}

interface PhoneNumber {
    id: string
    display_phone_number: string
    verified_name: string
    quality_rating: string
}

/**
 * POST /api/whatsapp/signup/callback
 * Handles the OAuth callback from Facebook after embedded signup
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { accessToken, wabaId, phoneNumberId, businessAccountId } = body

        if (!accessToken || !wabaId || !phoneNumberId) {
            return NextResponse.json(
                { success: false, error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        // Validate state parameter (CSRF protection)
        const stateCookie = request.cookies.get('whatsapp_signup_state')
        const stateParam = body.state

        if (stateCookie && stateParam && stateCookie.value !== stateParam) {
            return NextResponse.json(
                { success: false, error: 'Invalid state parameter' },
                { status: 403 }
            )
        }

        // Fetch WhatsApp Business Account details from Graph API
        const graphApiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || 'v24.0'

        // Get phone number details
        const phoneResponse = await fetch(
            `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}?access_token=${accessToken}`
        )

        if (!phoneResponse.ok) {
            throw new Error('Failed to fetch phone number details')
        }

        const phoneData: PhoneNumber = await phoneResponse.json()

        // Get WABA details
        const wabaResponse = await fetch(
            `https://graph.facebook.com/${graphApiVersion}/${wabaId}?access_token=${accessToken}`
        )

        if (!wabaResponse.ok) {
            throw new Error('Failed to fetch WABA details')
        }

        const wabaData: WhatsAppBusinessAccount = await wabaResponse.json()

        // Encrypt the access token
        const { encrypted, iv, authTag } = encryptToken(accessToken)

        // Calculate token expiration (Facebook tokens typically last 60 days)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 60)

        // Get current user ID from auth context
        // In production, you'd get this from your auth system
        const userId = request.headers.get('x-user-id') || null

        // Insert WhatsApp account
        const accountData: WhatsAppAccountInsert = {
            user_id: userId,
            business_account_id: businessAccountId || wabaId,
            waba_id: wabaId,
            phone_number_id: phoneNumberId,
            phone_number: phoneData.display_phone_number,
            display_name: phoneData.verified_name,
            quality_rating: phoneData.quality_rating,
            is_active: true,
        }

        const { data: account, error: accountError } = await supabase
            .from('whatsapp_accounts')
            .insert(accountData)
            .select()
            .single()

        if (accountError) {
            console.error('Error inserting account:', accountError)
            throw new Error('Failed to save WhatsApp account')
        }

        // Insert encrypted credentials
        const credentialData: WhatsAppCredentialInsert = {
            account_id: account.id,
            encrypted_access_token: encrypted,
            token_expires_at: expiresAt.toISOString(),
            encryption_iv: iv,
            encryption_auth_tag: authTag,
        }

        const { error: credentialError } = await supabase
            .from('whatsapp_credentials')
            .insert(credentialData)

        if (credentialError) {
            console.error('Error inserting credentials:', credentialError)
            // Rollback account insertion
            await supabase.from('whatsapp_accounts').delete().eq('id', account.id)
            throw new Error('Failed to save credentials')
        }

        // Clear state cookie
        const response = NextResponse.json({
            success: true,
            account: {
                id: account.id,
                phone_number: phoneData.display_phone_number,
                display_name: phoneData.verified_name,
                quality_rating: phoneData.quality_rating,
            },
        })

        response.cookies.delete('whatsapp_signup_state')

        return response
    } catch (error) {
        console.error('Error in signup callback:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to process signup'
            },
            { status: 500 }
        )
    }
}
