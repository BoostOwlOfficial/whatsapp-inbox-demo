import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function GET(request: NextRequest) {
    try {
        // Check if Supabase is configured at runtime
        if (!isSupabaseConfigured()) {
            console.warn("Supabase not configured, returning empty messages array")
            return NextResponse.json({ messages: [] })
        }

        const searchParams = request.nextUrl.searchParams
        const phoneNumberId = searchParams.get("phoneNumberId")
        const fromNumber = searchParams.get("fromNumber")
        const toNumber = searchParams.get("toNumber")
        const since = searchParams.get("since") // Timestamp for incremental polling
        const limit = parseInt(searchParams.get("limit") || "100")
        const offset = parseInt(searchParams.get("offset") || "0")

        // Build query
        let query = supabase
            .from("whatsapp_messages")
            .select("*")
            .order("timestamp", { ascending: true })
            .range(offset, offset + limit - 1)

        // Apply filters
        if (phoneNumberId) {
            query = query.eq("phone_number_id", phoneNumberId)
        }

        // Filter by timestamp (for incremental polling)
        if (since) {
            query = query.gt("timestamp", parseInt(since))
        }

        // Filter by conversation (bidirectional)
        if (fromNumber && toNumber) {
            query = query.or(
                `and(from_number.eq.${fromNumber},to_number.eq.${toNumber}),and(from_number.eq.${toNumber},to_number.eq.${fromNumber})`
            )
        } else if (fromNumber) {
            query = query.or(`from_number.eq.${fromNumber},to_number.eq.${fromNumber}`)
        } else if (toNumber) {
            query = query.or(`from_number.eq.${toNumber},to_number.eq.${toNumber}`)
        }

        const { data, error } = await query

        if (error) {
            console.error("Error fetching messages:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ messages: data || [] })
    } catch (error) {
        console.error("Failed to fetch messages:", error)
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }
}
