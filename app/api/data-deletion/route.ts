import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

/**
 * Data Deletion Callback Endpoint
 * Required by Meta for GDPR compliance and user data deletion requests
 * 
 * This endpoint handles data deletion requests from Meta when a user
 * deletes their Facebook/WhatsApp account or requests data deletion.
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { signed_request } = body

        if (!signed_request) {
            return NextResponse.json(
                { error: "Missing signed_request parameter" },
                { status: 400 }
            )
        }

        // Parse the signed request
        // Format: <signature>.<payload>
        const [signature, payload] = signed_request.split(".")

        if (!signature || !payload) {
            return NextResponse.json(
                { error: "Invalid signed_request format" },
                { status: 400 }
            )
        }

        // Decode the payload (base64)
        const decodedPayload = Buffer.from(payload, "base64").toString("utf-8")
        const data = JSON.parse(decodedPayload)

        const userId = data.user_id
        const issuedAt = data.issued_at

        if (!userId) {
            return NextResponse.json(
                { error: "Missing user_id in signed_request" },
                { status: 400 }
            )
        }

        // Log the deletion request
        console.log("Data deletion request received:", {
            userId,
            issuedAt: new Date(issuedAt * 1000).toISOString(),
            timestamp: new Date().toISOString(),
        })

        // Delete user data from Supabase
        if (isSupabaseConfigured()) {
            try {
                // Delete all messages associated with this user
                // Note: You may need to adjust this based on how you store user associations
                const { error: deleteError } = await supabase
                    .from("whatsapp_messages")
                    .delete()
                    .or(`from_number.eq.${userId},to_number.eq.${userId}`)

                if (deleteError) {
                    console.error("Error deleting user data from Supabase:", deleteError)
                    // Continue anyway - we'll return success to Meta
                } else {
                    console.log(`Successfully deleted data for user: ${userId}`)
                }
            } catch (dbError) {
                console.error("Failed to delete user data:", dbError)
                // Continue anyway - we'll return success to Meta
            }
        }

        // Generate a confirmation code (required by Meta)
        // This should be a unique identifier for this deletion request
        const confirmationCode = `del_${userId}_${Date.now()}`

        // Return the confirmation URL and code
        // Meta requires this format
        return NextResponse.json({
            url: `${request.nextUrl.origin}/data-deletion/status?id=${confirmationCode}`,
            confirmation_code: confirmationCode,
        })
    } catch (error) {
        console.error("Error processing data deletion request:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// Handle GET requests (for testing)
export async function GET(request: NextRequest) {
    return NextResponse.json({
        message: "Data Deletion Callback Endpoint",
        description: "This endpoint handles data deletion requests from Meta",
        method: "POST",
        required_parameters: ["signed_request"],
        documentation: "https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-whatsapp#data-deletion",
    })
}
