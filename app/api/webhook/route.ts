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
        entry.changes?.forEach(async (change: any) => {
          if (change.field === "messages") {
            const messages = change.value?.messages || []
            const contacts = change.value?.contacts || []
            const metadata = change.value?.metadata || {}

            // Create a map of contact info for quick lookup
            const contactMap = new Map(
              contacts.map((contact: any) => [
                contact.wa_id,
                contact.profile?.name || null
              ])
            )

            // Save each message to Supabase
            for (const message of messages) {
              const contactName = contactMap.get(message.from)

              console.log("New message received:", {
                from: message.from,
                to: metadata.display_phone_number,
                text: message.text?.body,
                type: message.type,
                timestamp: message.timestamp,
              })

              // Save to Supabase with retry logic
              try {
                const { supabase, isSupabaseConfigured } = await import("@/lib/supabase")
                const { retrySupabaseOperation } = await import("@/lib/retry-utils")

                // Only save if Supabase is configured
                if (!isSupabaseConfigured()) {
                  console.warn("Supabase not configured, skipping message storage")
                  continue
                }

                const messageData = {
                  id: message.id,
                  phone_number_id: metadata.phone_number_id,
                  from_number: message.from,
                  to_number: metadata.display_phone_number,
                  contact_name: contactName,
                  message_type: message.type,
                  message_text: message.text?.body || null,
                  timestamp: parseInt(message.timestamp),
                  status: "received" as const,
                  metadata: {
                    ...metadata,
                    raw_message: message,
                  },
                }

                // Retry the insert operation
                await retrySupabaseOperation(
                  async () => {
                    const { error } = await supabase
                      .from("whatsapp_messages")
                      .insert(messageData)

                    if (error) throw error
                  },
                  `Save message ${message.id.substring(0, 20)}`
                )

                console.log("✅ Message saved to Supabase:", message.id)
              } catch (error: any) {
                // Log detailed error for debugging
                console.error("Error saving message to Supabase:", {
                  message: error.message,
                  details: error.stack || error.toString(),
                  hint: error.hint || "",
                  code: error.code || "",
                })
              }
            }
          }

          if (change.field === "message_status") {
            const statuses = change.value?.statuses || []

            // Update message status in Supabase
            for (const status of statuses) {
              console.log("Message status update:", {
                messageId: status.id,
                status: status.status,
                timestamp: status.timestamp,
              })

              try {
                const { supabase, isSupabaseConfigured } = await import("@/lib/supabase")
                const { retrySupabaseOperation } = await import("@/lib/retry-utils")

                // Only update if Supabase is configured
                if (!isSupabaseConfigured()) {
                  console.warn("Supabase not configured, skipping status update")
                  continue
                }

                // Retry the update operation
                await retrySupabaseOperation(
                  async () => {
                    const { error } = await supabase
                      .from("whatsapp_messages")
                      .update({ status: status.status })
                      .eq("id", status.id)

                    if (error) throw error
                  },
                  `Update status for ${status.id.substring(0, 20)}`
                )

                console.log("✅ Message status updated:", status.id)
              } catch (error: any) {
                console.error("Error updating message status:", {
                  message: error.message,
                  details: error.stack || error.toString(),
                  code: error.code || "",
                })
              }
            }
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
