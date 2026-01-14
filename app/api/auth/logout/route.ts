import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth, getUser } from "@/lib/auth/middleware";

async function handleLogout(request: NextRequest) {
  try {
    // Get user from auth middleware
    const user = getUser(request as any);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get refresh token from cookie
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      // Revoke the refresh token
      await supabase
        .from("refresh_tokens")
        .update({ revoked_at: new Date().toISOString() })
        .eq("token", refreshToken)
        .eq("user_id", user.userId);
    }

    // Clear refresh token cookie
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.delete("refreshToken");

    return response;
  } catch (error) {
    console.error("[Logout] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return requireAuth(request, handleLogout);
}
