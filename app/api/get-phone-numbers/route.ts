import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { wabaId, accessToken, apiVersion = "v22.0" } = await request.json()

    if (!wabaId || !accessToken) {
      return NextResponse.json({ error: "Missing WABA ID or access token" }, { status: 400 })
    }

    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${wabaId}/phone_numbers`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("WhatsApp API error:", error)
      return NextResponse.json({ error: "Failed to fetch phone numbers", details: error }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      phone_numbers: data.data || [],
    })
  } catch (error) {
    console.error("Error fetching phone numbers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
