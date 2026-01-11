import { type NextRequest, NextResponse } from "next/server"

const VERIFY_TOKEN = "whatsapp_webhook_token"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified")
    return NextResponse.json(challenge)
  }

  return NextResponse.json({ error: "Invalid token" }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log incoming webhook for debugging
    console.log("Webhook received:", JSON.stringify(body, null, 2))

    // Process webhook data
    if (body.object === "whatsapp_business_account") {
      body.entry?.forEach((entry: any) => {
        entry.changes?.forEach((change: any) => {
          if (change.field === "messages") {
            const messages = change.value?.messages || []
            const contacts = change.value?.contacts || []
            const metadata = change.value?.metadata || {}

            messages.forEach((message: any) => {
              console.log("New message received:", {
                from: message.from,
                to: metadata.display_phone_number,
                text: message.text?.body,
                type: message.type,
                timestamp: message.timestamp,
              })

              // Here you could store the message in your database
              // or trigger other actions based on the incoming message
            })
          }

          if (change.field === "message_status") {
            const statuses = change.value?.statuses || []
            statuses.forEach((status: any) => {
              console.log("Message status update:", {
                messageId: status.id,
                status: status.status,
                timestamp: status.timestamp,
              })
            })
          }
        })
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}
