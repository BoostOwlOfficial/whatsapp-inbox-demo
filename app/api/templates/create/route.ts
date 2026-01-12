import { NextResponse } from "next/server"
import type { TemplateCreationRequest, TemplateCreationResponse } from "@/lib/template-creation-helpers"
import { validateTemplateCreation } from "@/lib/template-creation-helpers"

/**
 * POST /api/templates/create
 * Create a new WhatsApp message template
 * Accepts template data in request body and settings in Authorization header + query params
 */
export async function POST(request: Request) {
    try {
        // Get access token from Authorization header
        const authHeader = request.headers.get("Authorization")
        const accessToken = authHeader?.replace("Bearer ", "")

        // Get settings from query parameters
        const { searchParams } = new URL(request.url)
        const apiVersion = searchParams.get("apiVersion") || "v21.0"
        const wabaId = searchParams.get("wabaId")

        // Validate credentials
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

        // Build WhatsApp API URL
        const url = `https://graph.facebook.com/${apiVersion}/${wabaId}/message_templates`

        console.log("Creating template:", templateData.name)
        console.log("POST to:", url)

        // Send template creation request to WhatsApp API
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
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
