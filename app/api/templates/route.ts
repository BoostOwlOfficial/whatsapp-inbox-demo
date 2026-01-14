import { NextRequest, NextResponse } from "next/server"
import type { WhatsAppTemplatesResponse } from "@/lib/whatsapp-template-types"
import { getWhatsAppCredentials, getWhatsAppApiVersion } from "@/lib/whatsapp-credentials"

/**
 * GET /api/templates
 * Fetches message templates from WhatsApp Business Cloud API
 * Uses encrypted credentials from database
 */
export async function GET(request: NextRequest) {
    try {
        // Get optional user ID from query (for multi-user support)
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")

        // Get WhatsApp credentials from database
        let credentials
        try {
            credentials = await getWhatsAppCredentials(userId)
        } catch (error) {
            console.error("Error fetching credentials:", error)
            return NextResponse.json(
                {
                    error: "WhatsApp account not connected",
                    details: "Please connect your WhatsApp Business account first",
                },
                { status: 401 }
            )
        }

        if (!credentials) {
            return NextResponse.json(
                {
                    error: "No active WhatsApp account found",
                    details: "Please connect your WhatsApp Business account in settings",
                },
                { status: 404 }
            )
        }

        const apiVersion = getWhatsAppApiVersion()

        // Build WhatsApp API URL
        const url = `https://graph.facebook.com/${apiVersion}/${credentials.wabaId}/message_templates`

        console.log("Fetching templates from:", url)

        // Fetch templates from WhatsApp API
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${credentials.accessToken}`,
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error("WhatsApp API error:", errorData)

            return NextResponse.json(
                {
                    error: "Failed to fetch templates from WhatsApp",
                    details: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
                    status: response.status,
                },
                { status: response.status }
            )
        }

        const data: WhatsAppTemplatesResponse = await response.json()

        console.log(`Successfully fetched ${data.data?.length || 0} templates`)

        // Return the templates
        return NextResponse.json({
            templates: data.data || [],
            paging: data.paging,
            account: {
                displayName: credentials.displayName,
                phoneNumber: credentials.phoneNumber,
            },
        })
    } catch (error) {
        console.error("Error fetching templates:", error)
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
