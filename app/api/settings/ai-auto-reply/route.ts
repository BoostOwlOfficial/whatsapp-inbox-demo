import { type NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/settings/ai-auto-reply
 * Get current AI auto-reply settings for authenticated user
 */
export async function GET(request: NextRequest) {
  // Verify JWT token
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = decoded.userId;

  try {
    // Fetch user's AI auto-reply setting
    const { data, error } = await supabase
      .from("users")
      .select("use_ai_to_reply")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching AI auto-reply setting:", error);
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      use_ai_to_reply: data?.use_ai_to_reply || false,
    });
  } catch (error) {
    console.error("Error in GET /api/settings/ai-auto-reply:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/settings/ai-auto-reply
 * Toggle AI auto-reply on/off for authenticated user
 *
 * Request body: { enabled: boolean }
 */
export async function POST(request: NextRequest) {
  // Verify JWT token
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = decoded.userId;

  try {
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request: enabled must be a boolean" },
        { status: 400 },
      );
    }

    // Update user's AI auto-reply setting
    const { data, error } = await supabase
      .from("users")
      .update({
        use_ai_to_reply: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("use_ai_to_reply")
      .single();

    if (error) {
      console.error("Error updating AI auto-reply setting:", error);
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 },
      );
    }

    console.log(
      `✅ AI auto-reply ${enabled ? "enabled" : "disabled"} for user ${userId}`,
    );

    return NextResponse.json({
      success: true,
      use_ai_to_reply: data.use_ai_to_reply,
    });
  } catch (error) {
    console.error("Error in POST /api/settings/ai-auto-reply:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
