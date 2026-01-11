import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "whatsapp_webhook_token"
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || ""

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified")
    // Return plain text challenge value, not JSON
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: "Invalid token" }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature validation
    const rawBody = await request.text()

    // Validate X-Hub-Signature-256
    const signature = request.headers.get("X-Hub-Signature-256")

    if (!signature) {
      console.error("Missing X-Hub-Signature-256 header")
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    // Verify the signature
    if (APP_SECRET) {
      const expectedSignature = crypto
        .createHmac("sha256", APP_SECRET)
        .update(rawBody)
        .digest("hex")

      const signatureHash = signature.replace("sha256=", "")

      if (signatureHash !== expectedSignature) {
        console.error("Invalid signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    } else {
      console.warn("WHATSAPP_APP_SECRET not configured - skipping signature validation")
    }

    // Parse the validated body
    const body = JSON.parse(rawBody)

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
