import { type NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { sendWhatsAppMessage } from "@/lib/whatsapp-send";

export async function POST(request: NextRequest) {
  // Get authorization header
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify JWT token
  const token = authHeader.substring(7);
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = decoded.userId;

  try {
    const { recipientPhone, message } = await request.json();

    // Validate required fields
    if (!recipientPhone || !message) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: recipientPhone and message are required",
        },
        { status: 400 },
      );
    }

    // Send message using shared utility function
    const result = await sendWhatsAppMessage({
      userId,
      recipientPhone,
      message,
      saveToDb: true,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send message" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message_id: result.message_id,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
