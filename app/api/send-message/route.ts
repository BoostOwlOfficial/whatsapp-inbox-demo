import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { getWhatsAppCredentials, getWhatsAppApiVersion } from "@/lib/whatsapp-credentials"

export async function POST(request: NextRequest) {
  try {
    const { recipientPhone, message, userId } = await request.json()

    // Validate required fields
    if (!recipientPhone || !message) {
      return NextResponse.json(
        { error: "Missing required fields: recipientPhone and message are required" },
        { status: 400 }
      )
    }

    // Get WhatsApp credentials from database
    let credentials
    try {
      credentials = await getWhatsAppCredentials(userId)
    } catch (error) {
      console.error("Error fetching credentials:", error)
      return NextResponse.json(
        {
          error: "WhatsApp account not connected",
          details: "Please connect your WhatsApp Business account first",
        },
        { status: 401 }
      )
    }

    if (!credentials) {
      return NextResponse.json(
        {
          error: "No active WhatsApp account found",
          details: "Please connect your WhatsApp Business account in settings",
        },
        { status: 404 }
      )
    }

    const apiVersion = getWhatsAppApiVersion()

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
          to: recipientPhone,
          type: "text",
          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error("WhatsApp API error:", error)
      return NextResponse.json(
        { error: "Failed to send message", details: error },
        { status: response.status }
      )
    }

    const data = await response.json()
    const messageId = data.messages?.[0]?.id

    // Save sent message to Supabase
    if (isSupabaseConfigured() && messageId) {
      try {
        const messageData = {
          id: messageId,
          phone_number_id: credentials.phoneNumberId,
          from_number: credentials.phoneNumber || "",
          to_number: recipientPhone,
          contact_name: null,
          message_type: "text",
          message_text: message,
          timestamp: Math.floor(Date.now() / 1000),
          status: "sent",
          metadata: {
            sent_via: "api",
            whatsapp_response: data,
          },
        }

        const { error: dbError } = await supabase.from("whatsapp_messages").insert(messageData)

        if (dbError) {
          console.error("Error saving sent message to Supabase:", dbError)
        } else {
          console.log("Sent message saved to Supabase:", messageId)
        }
      } catch (dbError) {
        console.error("Failed to save sent message to Supabase:", dbError)
      }
    }

    return NextResponse.json({
      success: true,
      message_id: messageId,
      from: credentials.phoneNumber,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
