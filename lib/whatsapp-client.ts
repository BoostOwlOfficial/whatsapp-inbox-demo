/**
 * Client-side helper to check WhatsApp connection status
 * 
 * This replaces the need to store credentials in localStorage
 * All credentials are now stored encrypted in the database
 */

export interface WhatsAppAccountStatus {
    connected: boolean
    account: {
        id: string
        phone_number: string
        phone_number_id: string
        display_name: string
        quality_rating: string
        connected_at: string
    } | null
}

/**
 * Check if user has a connected WhatsApp account
 * @param accessToken - JWT access token for authentication
 */
export async function checkWhatsAppStatus(accessToken?: string): Promise<WhatsAppAccountStatus> {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        // Add authorization header if token is provided
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`
        }

        const response = await fetch('/api/whatsapp/signup/status', { headers })
        const data = await response.json()

        if (!data.success) {
            throw new Error(data.error || 'Failed to check WhatsApp status')
        }

        return {
            connected: data.connected,
            account: data.account,
        }
    } catch (error) {
        console.error('Error checking WhatsApp status:', error)
        return {
            connected: false,
            account: null,
        }
    }
}

/**
 * Send a WhatsApp message
 * No need to provide credentials - they're fetched from database
 */
export async function sendWhatsAppMessage(recipientPhone: string, message: string) {
    const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            recipientPhone,
            message,
        }),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
    }

    return data
}

/**
 * Fetch WhatsApp templates
 * No need to provide credentials - they're fetched from database
 */
export async function fetchWhatsAppTemplates() {
    const response = await fetch('/api/templates')
    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch templates')
    }

    return data
}

/**
 * Create a new WhatsApp template
 * No need to provide credentials - they're fetched from database
 */
export async function createWhatsAppTemplate(templateData: {
    name: string
    language: string
    category: string
    components: any[]
}) {
    const response = await fetch('/api/templates/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || 'Failed to create template')
    }

    return data
}
