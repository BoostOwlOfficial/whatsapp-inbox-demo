import { NextResponse } from "next/server"
import type { WhatsAppTemplatesResponse } from "@/lib/whatsapp-template-types"

/**
 * GET /api/templates
 * Fetches message templates from WhatsApp Business Cloud API
 * Accepts settings via Authorization header (Bearer token) and query parameters
 */
export async function GET(request: Request) {
    try {
        // Get access token from Authorization header
        const authHeader = request.headers.get("Authorization")
        const accessToken = authHeader?.replace("Bearer ", "")

        // Get settings from query parameters
        const { searchParams } = new URL(request.url)
        const apiVersion = searchParams.get("apiVersion") || "v21.0"
        const wabaId = searchParams.get("wabaId")

        // Validate required credentials
        if (!accessToken) {
            return NextResponse.json(
                {
                    error: "Missing access token",
                    details: "Authorization header with Bearer token is required",
                },
                { status: 401 }
            )
        }

        if (!wabaId) {
            return NextResponse.json(
                {
                    error: "Missing Business Account ID",
                    details: "Please configure your WhatsApp Business Account ID in Settings",
                },
                { status: 400 }
            )
        }

        // Build WhatsApp API URL
        const url = `https://graph.facebook.com/${apiVersion}/${wabaId}/message_templates`

        console.log("Fetching templates from:", url)

        // Fetch templates from WhatsApp API
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
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
