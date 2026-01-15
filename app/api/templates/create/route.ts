import { NextRequest, NextResponse } from "next/server"
import type { TemplateCreationRequest, TemplateCreationResponse } from "@/lib/template-creation-helpers"
import { validateTemplateCreation } from "@/lib/template-creation-helpers"
import { getWhatsAppCredentials, getWhatsAppApiVersion } from "@/lib/whatsapp-credentials"
import { verifyAccessToken } from "@/lib/auth/jwt"

/**
 * POST /api/templates/create
 * Create a new WhatsApp message template
 * Uses encrypted credentials from database
 */
export async function POST(request: NextRequest) {
    try {
        // Get authorization header
        const authHeader = request.headers.get("authorization")
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify JWT token
        const token = authHeader.substring(7)
        const decoded = verifyAccessToken(token)
        if (!decoded) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 })
        }

        const userId = decoded.userId

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

        // Parse request body
        const templateData: TemplateCreationRequest = await request.json()

        // Validate template data
        const validation = validateTemplateCreation(templateData)
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validation.errors.join("; "),
                    validationErrors: validation.errors,
                },
                { status: 400 }
            )
        }

        const apiVersion = getWhatsAppApiVersion()

        // Build WhatsApp API URL
        const url = `https://graph.facebook.com/${apiVersion}/${credentials.wabaId}/message_templates`

        console.log("Creating template:", templateData.name)
        console.log("POST to:", url)

        // Send template creation request to WhatsApp API
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${credentials.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(templateData),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error("WhatsApp API error:", errorData)

            // Extract error message
            const errorMessage = errorData.error?.message || errorData.error?.error_user_msg || "Unknown error"

            return NextResponse.json(
                {
                    error: "Failed to create template",
                    details: errorMessage,
                    whatsappError: errorData.error,
                    status: response.status,
                },
                { status: response.status }
            )
        }

        const data: TemplateCreationResponse = await response.json()

        console.log("Template created successfully:", data.id)

        // Return success response
        return NextResponse.json({
            success: true,
            template: data,
            message: "Template created successfully and sent for approval",
        })
    } catch (error) {
        console.error("Error creating template:", error)

        // Handle JSON parse errors
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    error: "Invalid request body",
                    details: "Request body must be valid JSON",
                },
                { status: 400 }
            )
        }

        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
