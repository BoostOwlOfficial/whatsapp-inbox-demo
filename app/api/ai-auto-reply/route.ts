import { type NextRequest, NextResponse } from "next/server";
import { processAIAutoReply } from "@/lib/ai-auto-reply";

/**
 * POST /api/ai-auto-reply
 * Core AI auto-reply logic - called internally by webhook or externally for testing
 *
 * Request body: {
 *   userId: string
 *   userMessage: string
 *   fromNumber: string
 *   phoneNumberId: string
 *   messageId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userMessage, fromNumber, phoneNumberId, messageId } = body;

    // Validate required fields
    if (
      !userId ||
      !userMessage ||
      !fromNumber ||
      !phoneNumberId ||
      !messageId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Process AI auto-reply using shared logic
    const result = await processAIAutoReply({
      userId,
      userMessage,
      fromNumber,
      phoneNumberId,
      messageId,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.success ? 200 : 500 },
      );
    }

    return NextResponse.json({
      success: result.success,
      messageSent: result.messageSent,
      confidenceScore: result.confidenceScore,
      usedFallback: result.usedFallback,
    });
  } catch (error) {
    console.error("❌ Error in AI auto-reply API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
