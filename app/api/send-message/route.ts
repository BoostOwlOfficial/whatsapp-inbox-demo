import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { accessToken, phoneNumberId, recipientPhone, message, apiVersion, senderPhone } = await request.json()

    const missingFields = []
    if (!accessToken) missingFields.push("accessToken")
    if (!phoneNumberId) missingFields.push("phoneNumberId")
    if (!recipientPhone) missingFields.push("recipientPhone")
    if (!message) missingFields.push("message")
    if (!apiVersion) missingFields.push("apiVersion")

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }

    // Send message via WhatsApp API
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
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
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("WhatsApp API error:", error)
      return NextResponse.json({ error: "Failed to send message", details: error }, { status: response.status })
    }

    const data = await response.json()
    const messageId = data.messages?.[0]?.id

    // Save sent message to Supabase
    if (isSupabaseConfigured() && messageId) {
      try {
        const messageData = {
          id: messageId,
          phone_number_id: phoneNumberId,
          from_number: senderPhone || "",
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

        const { error: dbError } = await supabase
          .from("whatsapp_messages")
          .insert(messageData)

        if (dbError) {
          console.error("Error saving sent message to Supabase:", dbError)
          // Don't fail the request if Supabase save fails
        } else {
          console.log("Sent message saved to Supabase:", messageId)
        }
      } catch (dbError) {
        console.error("Failed to save sent message to Supabase:", dbError)
        // Don't fail the request if Supabase save fails
      }
    }

    return NextResponse.json({
      success: true,
      message_id: messageId,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
