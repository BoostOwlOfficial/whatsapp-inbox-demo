import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accessToken, phoneNumberId, recipientPhone, message, apiVersion } = await request.json()

    const missingFields = []
    if (!accessToken) missingFields.push("accessToken")
    if (!phoneNumberId) missingFields.push("phoneNumberId")
    if (!recipientPhone) missingFields.push("recipientPhone")
    if (!message) missingFields.push("message")
    if (!apiVersion) missingFields.push("apiVersion")

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }

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
    return NextResponse.json({
      success: true,
      message_id: data.messages?.[0]?.id,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
