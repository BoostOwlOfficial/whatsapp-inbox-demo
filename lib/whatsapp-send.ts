import {
  getWhatsAppCredentials,
  getWhatsAppApiVersion,
} from "@/lib/whatsapp-credentials";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Send a WhatsApp message without requiring JWT authentication
 * This utility function can be used from both authenticated APIs and internal webhook processing
 *
 * @param params - Message parameters
 * @param params.userId - User ID to fetch WhatsApp credentials
 * @param params.recipientPhone - Recipient phone number (include country code)
 * @param params.message - Message text to send
 * @param params.saveToDb - Whether to save the message to database (default: false)
 * @returns Promise with success status, message ID, or error
 */
export async function sendWhatsAppMessage(params: {
  userId: string;
  recipientPhone: string;
  message: string;
  saveToDb?: boolean;
}): Promise<{ success: boolean; message_id?: string; error?: string }> {
  try {
    console.log(`📤 Sending WhatsApp message for user ${params.userId}`);

    // Get WhatsApp credentials from database using userId
    const credentials = await getWhatsAppCredentials(params.userId);

    if (!credentials) {
      console.error(
        "❌ WhatsApp credentials not found for user:",
        params.userId,
      );
      return { success: false, error: "WhatsApp account not connected" };
    }

    const apiVersion = getWhatsAppApiVersion();

    // Send message via WhatsApp API
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${credentials.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: params.recipientPhone,
          type: "text",
          text: {
            preview_url: false,
            body: params.message,
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ WhatsApp API error:", error);
      return {
        success: false,
        error: error.error?.message || "Failed to send message",
      };
    }

    const data = await response.json();
    const messageId = data.messages?.[0]?.id;

    console.log(`✅ Message sent successfully. ID: ${messageId}`);

    // Optionally save to database
    if (params.saveToDb && isSupabaseConfigured() && messageId) {
      try {
        const messageData = {
          id: messageId,
          phone_number_id: credentials.phoneNumberId,
          from_number: credentials.phoneNumber || "",
          to_number: params.recipientPhone,
          contact_name: null,
          message_type: "text",
          message_text: params.message,
          timestamp: Math.floor(Date.now() / 1000),
          status: "sent",
          direction: "outbound" as const,
          metadata: {
            sent_via: "whatsapp_send_utility",
          },
        };

        const { error: dbError } = await supabase
          .from("whatsapp_messages")
          .insert(messageData);

        if (dbError) {
          console.error("⚠️ Error saving message to database:", dbError);
        } else {
          console.log(`💾 Message saved to database: ${messageId}`);
        }
      } catch (dbError) {
        console.error("⚠️ Failed to save message to database:", dbError);
        // Don't fail the whole operation if DB save fails
      }
    }

    return { success: true, message_id: messageId };
  } catch (error) {
    console.error("❌ Error in sendWhatsAppMessage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
