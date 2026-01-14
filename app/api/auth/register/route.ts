import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  hashPassword,
  validateEmail,
  validatePassword,
} from "@/lib/auth/password";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { success: false, error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name,
      })
      .select("id, email, name, created_at")
      .single();

    if (userError || !user) {
      console.error("[Register] Error creating user:", userError);
      return NextResponse.json(
        { success: false, error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Generate tokens
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
      console.error("[Register] Error creating refresh token:", tokenError);
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
    console.error("[Register] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
