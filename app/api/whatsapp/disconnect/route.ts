import { NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { requireAuth, getUser } from "@/lib/auth/middleware"

/**
 * POST /api/whatsapp/disconnect
 * Disconnect WhatsApp Business account
 * - Deletes all messages associated with the account
 * - Deletes account record from database
 * - Note: WhatsApp doesn't provide a programmatic disconnect API
 *   Users must manually unsubscribe via Facebook Business Manager if needed
 */
async function handleDisconnect(request: NextRequest) {
    try {
        // Get authenticated user
        const authUser = getUser(request as any);

        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = authUser.userId
        console.log(`[Disconnect] Request from user: ${userId}`)

        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
            return NextResponse.json(
                { error: "Database not configured" },
                { status: 500 }
            )
        }

        // STEP 1: Get WhatsApp account details (to get phone_number_id)
        // Use same query as status endpoint for consistency
        const { data: accounts, error: fetchError } = await supabase
            .from("whatsapp_accounts")
            .select("phone_number_id, display_name, phone_number")
            .eq("user_id", userId)
            .eq("is_active", true)
            .order("connected_at", { ascending: false })
            .limit(1)

        if (fetchError) {
            console.error("[Disconnect] Error fetching WhatsApp account:", fetchError)
            return NextResponse.json(
                {
                    error: "Failed to fetch WhatsApp account",
                    details: fetchError.message,
                },
                { status: 500 }
            )
        }

        if (!accounts || accounts.length === 0) {
            console.log("[Disconnect] No active WhatsApp account found for user:", userId)
            return NextResponse.json(
                {
                    error: "No WhatsApp account found",
                    details: "No active WhatsApp account to disconnect",
                },
                { status: 404 }
            )
        }

        const account = accounts[0]

        console.log(`🗑️  Disconnecting WhatsApp account for user: ${userId}`)
        console.log(`📱 Phone Number ID: ${account.phone_number_id}`)

        // STEP 2: Delete all messages associated with this phone_number_id
        const { data: deletedMessages, error: messagesError } = await supabase
            .from("whatsapp_messages")
            .delete()
            .eq("phone_number_id", account.phone_number_id)
            .select("id")

        if (messagesError) {
            console.error("[Disconnect] Error deleting messages:", messagesError)
            return NextResponse.json(
                {
                    error: "Failed to delete messages",
                    details: messagesError.message,
                },
                { status: 500 }
            )
        }

        const messageCount = deletedMessages?.length || 0
        console.log(`✅ Deleted ${messageCount} messages`)

        // STEP 3: Delete the WhatsApp account (or mark as inactive)
        const { error: accountError } = await supabase
            .from("whatsapp_accounts")
            .delete()
            .eq("user_id", userId)
            .eq("is_active", true)

        if (accountError) {
            console.error("[Disconnect] Error deleting WhatsApp account:", accountError)
            return NextResponse.json(
                {
                    error: "Failed to disconnect WhatsApp account",
                    details: accountError.message,
                },
                { status: 500 }
            )
        }

        console.log(`✅ WhatsApp account disconnected for user: ${userId}`)

        return NextResponse.json({
            success: true,
            message: "WhatsApp account disconnected successfully",
            disconnectedAccount: {
                businessName: account.display_name,
                phoneNumber: account.phone_number,
            },
            deletedMessagesCount: messageCount,
        })
    } catch (error) {
        console.error("[Disconnect] Error in disconnect endpoint:", error)
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}

/**
 * POST /api/whatsapp/disconnect
 * Disconnect WhatsApp Business account
 */
export async function POST(request: NextRequest) {
    return requireAuth(request, handleDisconnect);
}
