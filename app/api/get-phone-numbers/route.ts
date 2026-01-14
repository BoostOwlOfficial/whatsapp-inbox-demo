import { type NextRequest, NextResponse } from "next/server"
import { getWhatsAppCredentials, getWhatsAppApiVersion } from "@/lib/whatsapp-credentials"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

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
          details: "Please connect your WhatsApp Business account",
        },
        { status: 404 }
      )
    }

    const apiVersion = getWhatsAppApiVersion()

    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${credentials.wabaId}/phone_numbers`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error("WhatsApp API error:", error)
      return NextResponse.json(
        { error: "Failed to fetch phone numbers", details: error },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      phone_numbers: data.data || [],
      account: {
        displayName: credentials.displayName,
        phoneNumber: credentials.phoneNumber,
      },
    })
  } catch (error) {
    console.error("Error fetching phone numbers:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
