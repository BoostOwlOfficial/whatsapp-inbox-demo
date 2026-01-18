import { type NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/ai-responses
 * List all AI responses for authenticated user
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
    // Fetch all responses for this user
    const { data, error } = await supabase
      .from("ai_responses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching AI responses:", error);
      return NextResponse.json(
        { error: "Failed to fetch responses" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      responses: data || [],
    });
  } catch (error) {
    console.error("Error in GET /api/ai-responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/ai-responses
 * Add a new AI response for authenticated user
 *
 * Request body: {
 *   response_text: string
 *   keywords?: string[]
 *   category?: string
 *   is_active?: boolean
 * }
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
    const { response_text, keywords, category, is_active } = body;

    // Validate required fields
    if (!response_text || typeof response_text !== "string") {
      return NextResponse.json(
        { error: "response_text is required and must be a string" },
        { status: 400 },
      );
    }

    if (response_text.trim().length === 0) {
      return NextResponse.json(
        { error: "response_text cannot be empty" },
        { status: 400 },
      );
    }

    // Insert new response
    const { data, error } = await supabase
      .from("ai_responses")
      .insert({
        user_id: userId,
        response_text: response_text.trim(),
        keywords: keywords || null,
        category: category || null,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating AI response:", error);
      return NextResponse.json(
        { error: "Failed to create response" },
        { status: 500 },
      );
    }

    console.log(`✅ AI response created for user ${userId}`);

    return NextResponse.json({
      success: true,
      response: data,
    });
  } catch (error) {
    console.error("Error in POST /api/ai-responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/ai-responses
 * Update an existing AI response
 *
 * Request body: {
 *   id: string
 *   response_text?: string
 *   keywords?: string[]
 *   category?: string
 *   is_active?: boolean
 * }
 */
export async function PUT(request: NextRequest) {
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
    const { id, response_text, keywords, category, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Build update object with only provided fields
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (response_text !== undefined) {
      if (
        typeof response_text !== "string" ||
        response_text.trim().length === 0
      ) {
        return NextResponse.json(
          { error: "response_text must be a non-empty string" },
          { status: 400 },
        );
      }
      updates.response_text = response_text.trim();
    }

    if (keywords !== undefined) updates.keywords = keywords;
    if (category !== undefined) updates.category = category;
    if (is_active !== undefined) updates.is_active = is_active;

    // Update response (ensuring it belongs to the user)
    const { data, error } = await supabase
      .from("ai_responses")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId) // Security: only update own responses
      .select()
      .single();

    if (error) {
      console.error("Error updating AI response:", error);
      return NextResponse.json(
        { error: "Failed to update response" },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Response not found or unauthorized" },
        { status: 404 },
      );
    }

    console.log(`✅ AI response ${id} updated for user ${userId}`);

    return NextResponse.json({
      success: true,
      response: data,
    });
  } catch (error) {
    console.error("Error in PUT /api/ai-responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/ai-responses
 * Delete an AI response
 *
 * Request body: { id: string }
 */
export async function DELETE(request: NextRequest) {
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
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Delete response (ensuring it belongs to the user)
    const { error } = await supabase
      .from("ai_responses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId); // Security: only delete own responses

    if (error) {
      console.error("Error deleting AI response:", error);
      return NextResponse.json(
        { error: "Failed to delete response" },
        { status: 500 },
      );
    }

    console.log(`✅ AI response ${id} deleted for user ${userId}`);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in DELETE /api/ai-responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
