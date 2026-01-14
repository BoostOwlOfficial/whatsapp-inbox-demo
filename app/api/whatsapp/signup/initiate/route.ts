import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * POST /api/whatsapp/signup/initiate
 * Initiates the WhatsApp Embedded Signup flow
 * Returns configuration needed for Facebook SDK
 */
export async function POST(request: NextRequest) {
    try {
        // Generate state parameter for CSRF protection
        const state = crypto.randomBytes(32).toString('hex')

        // In a production app, you would store this state in a session or database
        // to validate it when the callback is received
        // For now, we'll use a simple approach with a cookie

        const config = {
            appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '2074250006740949',
            configId: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID || '829902823419760',
            redirectUrl: process.env.FACEBOOK_REDIRECT_URL || 'https://business.facebook.com/messaging/whatsapp/onboard/?app_id=2074250006740949&config_id=829902823419760&extras=%7B%22sessionInfoVersion%22%3A%223%22%2C%22version%22%3A%22v3%22%7D',
            state,
        }

        const response = NextResponse.json({
            success: true,
            config,
        })

        // Set state as httpOnly cookie for security
        response.cookies.set('whatsapp_signup_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600, // 10 minutes
        })

        return response
    } catch (error) {
        console.error('Error initiating signup:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to initiate signup' },
            { status: 500 }
        )
    }
}
