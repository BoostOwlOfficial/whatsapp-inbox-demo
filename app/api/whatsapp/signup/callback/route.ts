import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { encryptToken } from "@/lib/crypto-utils";
import type {
  WhatsAppAccountInsert,
  WhatsAppCredentialInsert,
} from "@/lib/supabase";

interface FacebookCallbackData {
  code: string;
  state?: string;
}

interface WhatsAppBusinessAccount {
  id: string;
  name: string;
  timezone_id: string;
}

interface PhoneNumber {
  id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating: string;
}

/**
 * POST /api/whatsapp/signup/callback
 * Handles the OAuth callback from Facebook after embedded signup
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[Callback] Processing WhatsApp signup callback...");
    const body = await request.json();
    console.log("[Callback] Request body:", JSON.stringify(body, null, 2));

    const { code, state, userId } = body;

    // Validate required params
    if (!code) {
      console.error("[Callback] Missing code parameter");
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    console.log("[Callback] Code received, will get user from JWT token later");

    // Validate state parameter (CSRF protection)
    const stateCookie = request.cookies.get("whatsapp_signup_state");
    if (stateCookie && state && stateCookie.value !== state) {
      console.error("[Callback] Invalid state parameter");
      return NextResponse.json(
        { success: false, error: "Invalid state parameter" },
        { status: 403 }
      );
    }

    console.log("[Callback] Exchanging code for access token...");

    // Exchange authorization code for access token
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "2074250006740949";
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appSecret) {
      console.error("[Callback] FACEBOOK_APP_SECRET not configured");
      throw new Error(
        "Server configuration error: Missing Facebook App Secret"
      );
    }

    // Use POST with JSON body as per Facebook OAuth documentation
    const tokenUrl = "https://graph.facebook.com/v24.0/oauth/access_token";

    console.log("[Callback] Fetching access token from Facebook...");
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: appId,
        client_secret: appSecret,
        code: code,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[Callback] Token exchange failed:", errorText);
      throw new Error(`Failed to exchange code for token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log("[Callback] Token received:", {
      hasAccessToken: !!tokenData.access_token,
      expiresIn: tokenData.expires_in,
    });

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("[Callback] No access token in response:", tokenData);
      throw new Error("Failed to obtain access token");
    }

    // Now use the access token to get WhatsApp Business Account details
    console.log("[Callback] Fetching WhatsApp Business Account details...");
    const graphApiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || "v24.0";

    // For WhatsApp Embedded Signup, the access token is scoped to the WABA
    // Use debug_token to get information about the token and WABA
    // We need an app access token for this (not the user token)
    const appAccessToken = `${appId}|${appSecret}`;
    const debugTokenUrl = `https://graph.facebook.com/${graphApiVersion}/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`;
    const debugResponse = await fetch(debugTokenUrl);

    if (!debugResponse.ok) {
      const errorText = await debugResponse.text();
      console.error("[Callback] Failed to debug token:", errorText);
      throw new Error("Failed to get token information");
    }

    const debugData = await debugResponse.json();
    console.log("[Callback] Token debug data:", debugData);

    // The token data contains granular_scopes which has the WABA ID
    const granularScopes = debugData.data?.granular_scopes;
    console.log("[Callback] Granular scopes:", granularScopes);

    // Extract WABA ID from granular scopes
    let wabaId: string | null = null;

    if (granularScopes) {
      for (const scope of granularScopes) {
        if (
          scope.scope === "whatsapp_business_management" &&
          scope.target_ids &&
          scope.target_ids.length > 0
        ) {
          wabaId = scope.target_ids[0];
          break;
        }
      }
    }

    if (!wabaId) {
      console.error("[Callback] Could not extract WABA ID from token");
      console.error(
        "[Callback] Debug data:",
        JSON.stringify(debugData, null, 2)
      );
      throw new Error(
        "Could not identify WhatsApp Business Account from token"
      );
    }

    console.log("[Callback] WABA ID:", wabaId);

    // Get WABA details
    const wabaUrl = `https://graph.facebook.com/${graphApiVersion}/${wabaId}?fields=id,name,timezone_id&access_token=${accessToken}`;
    const wabaResponse = await fetch(wabaUrl);

    if (!wabaResponse.ok) {
      const errorText = await wabaResponse.text();
      console.error("[Callback] Failed to fetch WABA details:", errorText);
      throw new Error("Failed to fetch WhatsApp Business Account details");
    }

    const wabaData = await wabaResponse.json();
    console.log("[Callback] WABA data:", wabaData);

    // Get phone numbers for this WABA
    const phoneNumbersUrl = `https://graph.facebook.com/${graphApiVersion}/${wabaId}/phone_numbers?access_token=${accessToken}`;
    const phoneNumbersResponse = await fetch(phoneNumbersUrl);

    if (!phoneNumbersResponse.ok) {
      const errorText = await phoneNumbersResponse.text();
      console.error("[Callback] Failed to fetch phone numbers:", errorText);
      throw new Error("Failed to fetch phone numbers");
    }

    const phoneNumbersData = await phoneNumbersResponse.json();
    console.log("[Callback] Phone numbers:", phoneNumbersData);

    if (!phoneNumbersData.data || phoneNumbersData.data.length === 0) {
      throw new Error(
        "No phone numbers found for this WhatsApp Business Account"
      );
    }

    const phoneNumber = phoneNumbersData.data[0];
    const phoneNumberId = phoneNumber.id;
    const businessAccountId = wabaId;

    // We already have WABA data and phone number data from above
    // Use the phone number data directly
    const phoneData: PhoneNumber = {
      id: phoneNumber.id,
      display_phone_number: phoneNumber.display_phone_number,
      verified_name: phoneNumber.verified_name,
      quality_rating: phoneNumber.quality_rating,
    };

    // Encrypt the access token
    const { encrypted, iv, authTag } = encryptToken(accessToken);

    // Calculate token expiration (Facebook tokens typically last 60 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    // User ID was sent in the request body from frontend
    console.log("[Callback] Using user ID from body:", userId);

    // Insert WhatsApp account
    const accountData: WhatsAppAccountInsert = {
      user_id: userId,
      business_account_id: businessAccountId || wabaId,
      waba_id: wabaId,
      phone_number_id: phoneNumberId,
      phone_number: phoneData.display_phone_number,
      display_name: phoneData.verified_name,
      quality_rating: phoneData.quality_rating,
      is_active: true,
    };

    const { data: account, error: accountError } = await supabase
      .from("whatsapp_accounts")
      .insert(accountData)
      .select()
      .single();

    if (accountError) {
      console.error("Error inserting account:", accountError);
      throw new Error("Failed to save WhatsApp account");
    }

    // Insert encrypted credentials
    const credentialData: WhatsAppCredentialInsert = {
      account_id: account.id,
      encrypted_access_token: encrypted,
      token_expires_at: expiresAt.toISOString(),
      encryption_iv: iv,
      encryption_auth_tag: authTag,
    };

    const { error: credentialError } = await supabase
      .from("whatsapp_credentials")
      .insert(credentialData);

    if (credentialError) {
      console.error("Error inserting credentials:", credentialError);
      // Rollback account insertion
      await supabase.from("whatsapp_accounts").delete().eq("id", account.id);
      throw new Error("Failed to save credentials");
    }

    // Clear state cookie
    const response = NextResponse.json({
      success: true,
      account: {
        id: account.id,
        phone_number: phoneData.display_phone_number,
        display_name: phoneData.verified_name,
        quality_rating: phoneData.quality_rating,
      },
    });

    response.cookies.delete("whatsapp_signup_state");

    return response;
  } catch (error) {
    console.error("Error in signup callback:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process signup",
      },
      { status: 500 }
    );
  }
}
