import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "No refresh token provided" },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // Check if refresh token exists and is not revoked
    const { data: tokenRecord, error: tokenError } = await supabase
      .from("refresh_tokens")
      .select("id, user_id, expires_at, revoked_at")
      .eq("id", payload.tokenId)
      .eq("token", refreshToken)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Check if token is revoked
    if (tokenRecord.revoked_at) {
      return NextResponse.json(
        { success: false, error: "Refresh token has been revoked" },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Refresh token has expired" },
        { status: 401 }
      );
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name, is_active")
      .eq("id", tokenRecord.user_id)
      .single();

    if (userError || !user || !user.is_active) {
      return NextResponse.json(
        { success: false, error: "User not found or inactive" },
        { status: 401 }
      );
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("[Refresh] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
