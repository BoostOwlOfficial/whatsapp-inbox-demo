import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth, getUser } from "@/lib/auth/middleware";

async function handleGetStatus(request: NextRequest) {
  try {
    // Get authenticated user from JWT token
    const authUser = getUser(request as any);

    if (!authUser) {
      return NextResponse.json({
        success: true,
        connected: false,
        account: null,
      });
    }

    console.log("[Status] Checking for user:", authUser.userId);

    // Query for active WhatsApp accounts
    const { data: accounts, error } = await supabase
      .from("whatsapp_accounts")
      .select("*")
      .eq("user_id", authUser.userId)
      .eq("is_active", true)
      .order("connected_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("[Status] Error fetching account:", error);
      throw new Error("Failed to check account status");
    }

    console.log("[Status] Found accounts:", accounts?.length || 0);

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({
        success: true,
        connected: false,
        account: null,
      });
    }

    const account = accounts[0];

    return NextResponse.json({
      success: true,
      connected: true,
      account: {
        id: account.id,
        phone_number: account.phone_number,
        display_name: account.display_name,
        quality_rating: account.quality_rating,
        connected_at: account.connected_at,
      },
    });
  } catch (error) {
    console.error("[Status] Error checking signup status:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to check status",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/whatsapp/signup/status
 * Checks if the authenticated user has connected a WhatsApp account
 */
export async function GET(request: NextRequest) {
  return requireAuth(request, handleGetStatus);
}
