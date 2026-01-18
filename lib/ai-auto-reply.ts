/**
 * AI Auto-Reply Core Logic
 * Can be called from webhook or API routes
 */

import { supabase } from "@/lib/supabase";
import { sendWhatsAppMessage } from "@/lib/whatsapp-send";
import { matchMessageToResponse } from "@/lib/grok-api";

// Fallback message when confidence is low
const FALLBACK_MESSAGE =
  "Thank you for your message. We didn't quite understand your request. Could you please rephrase it or provide more details?";

export interface AIAutoReplyParams {
  userId: string;
  userMessage: string;
  fromNumber: string;
  phoneNumberId: string;
  messageId: string;
}

export interface AIAutoReplyResult {
  success: boolean;
  messageSent: boolean;
  confidenceScore: number;
  usedFallback: boolean;
  error?: string;
}

/**
 * Process AI auto-reply for an incoming message
 */
export async function processAIAutoReply(
  params: AIAutoReplyParams,
): Promise<AIAutoReplyResult> {
  const { userId, userMessage, fromNumber, phoneNumberId, messageId } = params;

  try {
    console.log(`🤖 AI Auto-Reply: Processing for user ${userId}`);
    console.log(`   Message: "${userMessage.substring(0, 50)}..."`);
    // Step 1: Check if AI auto-reply is enabled
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("use_ai_to_reply")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user settings:", userError);
      return {
        success: false,
        messageSent: false,
        confidenceScore: 0,
        usedFallback: false,
        error: "Failed to fetch user settings",
      };
    }

    if (!userData?.use_ai_to_reply) {
      return {
        success: true,
        messageSent: false,
        confidenceScore: 0,
        usedFallback: false,
      };
    }

    // Step 2: Fetch user's predefined responses
    const { data: responses, error: responsesError } = await supabase
      .from("ai_responses")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (responsesError) {
      console.error("Error fetching AI responses:", responsesError);
      return {
        success: false,
        messageSent: false,
        confidenceScore: 0,
        usedFallback: false,
        error: "Failed to fetch responses",
      };
    }

    if (!responses || responses.length === 0) {
      console.warn(`⚠️ No active responses configured for user ${userId}`);
      return {
        success: false,
        messageSent: false,
        confidenceScore: 0,
        usedFallback: false,
        error: "No responses configured",
      };
    }

    // Step 3: Call Grok API to match message
    const grokResult = await matchMessageToResponse(
      userMessage,
      responses.map((r) => r.response_text),
    );

    // Step 4: Determine which response to send
    let responseText: string;
    let selectedResponseId: string | null = null;
    const confidenceThreshold = 70;

    if (
      grokResult.confidence_score >= confidenceThreshold &&
      grokResult.matched_response_index !== null &&
      grokResult.matched_response_index >= 0 &&
      grokResult.matched_response_index < responses.length
    ) {
      // High confidence - use matched response
      const matchedResponse = responses[grokResult.matched_response_index];
      responseText = matchedResponse.response_text;
      selectedResponseId = matchedResponse.id;
    } else {
      // Low confidence - use fallback
      responseText = FALLBACK_MESSAGE;
    }

    // Step 5: Send message using shared utility
    const sendResult = await sendWhatsAppMessage({
      userId,
      recipientPhone: fromNumber,
      message: responseText,
      saveToDb: true,
    });

    if (!sendResult.success) {
      console.error(`❌ Failed to send auto-reply: ${sendResult.error}`);
    }

    // Step 6: Log the interaction for audit trail
    try {
      const { error: logError } = await supabase.from("ai_reply_logs").insert({
        user_id: userId,
        message_id: messageId,
        user_message: userMessage,
        selected_response_id: selectedResponseId,
        selected_response_text: responseText,
        confidence_score: grokResult.confidence_score,
        was_sent: sendResult.success,
        grok_api_response: grokResult,
      });

      if (logError) {
        console.error("⚠️ Error logging AI interaction:", logError);
      } else {
        console.log(`💾 AI interaction logged successfully`);
      }
    } catch (logError) {
      console.error("⚠️ Failed to log AI interaction:", logError);
    }

    // Return success
    return {
      success: sendResult.success,
      messageSent: sendResult.success,
      confidenceScore: grokResult.confidence_score,
      usedFallback: selectedResponseId === null,
    };
  } catch (error) {
    console.error("❌ Error in AI auto-reply:", error);
    return {
      success: false,
      messageSent: false,
      confidenceScore: 0,
      usedFallback: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
