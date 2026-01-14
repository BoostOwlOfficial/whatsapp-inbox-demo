import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { comparePassword } from "@/lib/auth/password";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name, password_hash, is_active")
      .eq("email", email.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: "Account is deactivated" },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login time
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);

    // Generate access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    // Create refresh token record
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setSeconds(
      refreshTokenExpiry.getSeconds() + getRefreshTokenExpiry()
    );

    const { data: refreshTokenRecord, error: tokenError } = await supabase
      .from("refresh_tokens")
      .insert({
        user_id: user.id,
        token: "", // Will update after generation
        expires_at: refreshTokenExpiry.toISOString(),
        user_agent: request.headers.get("user-agent"),
        ip_address:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip"),
      })
      .select("id")
      .single();

    if (tokenError || !refreshTokenRecord) {
      console.error("[Login] Error creating refresh token:", tokenError);
      return NextResponse.json(
        { success: false, error: "Failed to create session" },
        { status: 500 }
      );
    }

    const refreshToken = generateRefreshToken({
      userId: user.id,
      tokenId: refreshTokenRecord.id,
    });

    // Update refresh token with generated token
    await supabase
      .from("refresh_tokens")
      .update({ token: refreshToken })
      .eq("id", refreshTokenRecord.id);

    // Set refresh token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: getRefreshTokenExpiry(),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Login] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
