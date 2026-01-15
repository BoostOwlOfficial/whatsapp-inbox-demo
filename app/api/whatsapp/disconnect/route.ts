import { NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { verifyAccessToken } from "@/lib/auth/jwt"

/**
 * POST /api/whatsapp/disconnect
 * Disconnect WhatsApp Business account
 * - Deletes account record from database
 * - Note: WhatsApp doesn't provide a programmatic disconnect API
 *   Users must manually unsubscribe via Facebook Business Manager if needed
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

        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
            return NextResponse.json(
                { error: "Database not configured" },
                { status: 500 }
            )
        }

        // Delete WhatsApp account from database
        const { data, error } = await supabase
            .from("whatsapp_accounts")
            .delete()
            .eq("user_id", userId)
            .select()

        if (error) {
            console.error("Error deleting WhatsApp account:", error)
            return NextResponse.json(
                {
                    error: "Failed to disconnect WhatsApp account",
                    details: error.message,
                },
                { status: 500 }
            )
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                {
                    error: "No WhatsApp account found",
                    details: "No active WhatsApp account to disconnect",
                },
                { status: 404 }
            )
        }

        console.log(`✅ WhatsApp account disconnected for user: ${userId}`)

        return NextResponse.json({
            success: true,
            message: "WhatsApp account disconnected successfully",
            disconnectedAccount: {
                businessName: data[0].business_name,
                phoneNumber: data[0].phone_number,
            },
        })
    } catch (error) {
        console.error("Error in disconnect endpoint:", error)
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
