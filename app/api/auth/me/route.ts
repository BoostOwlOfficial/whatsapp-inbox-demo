import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth, getUser } from "@/lib/auth/middleware";

async function handleGetMe(request: NextRequest) {
  try {
    // Get user from auth middleware
    const authUser = getUser(request as any);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get full user data from database
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, created_at, last_login_at")
      .eq("id", authUser.userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      },
    });
  } catch (error) {
    console.error("[Me] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return requireAuth(request, handleGetMe);
}
