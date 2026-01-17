import { supabaseAdmin as supabase } from "./supabase-admin";
import { decryptToken } from "./crypto-utils";
import type { WhatsAppAccount, WhatsAppCredential } from "./supabase";

interface WhatsAppAccountWithCredentials extends WhatsAppAccount {
  whatsapp_credentials: WhatsAppCredential[];
}

interface DecryptedCredentials {
  accessToken: string;
  phoneNumberId: string;
  wabaId: string;
  businessAccountId: string;
  displayName: string | null;
  phoneNumber: string | null;
  expiresAt: string | null;
}

/**
 * Fetches the active WhatsApp account with decrypted credentials
 * @param userId - Optional user ID to filter accounts (if using multi-user)
 * @returns Decrypted credentials or null if no active account
 */
export async function getWhatsAppCredentials(
  userId?: string | null
): Promise<DecryptedCredentials | null> {
  try {
    console.log("🔎 getWhatsAppCredentials called with userId:", userId);

    // Build query
    let query = supabase
      .from("whatsapp_accounts")
      .select(
        `
                *,
                whatsapp_credentials (*)
            `
      )
      .eq("is_active", true)
      .order("connected_at", { ascending: false })
      .limit(1);

    // Add user filter if provided
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: accounts, error } = await query;

    if (error) {
      console.error("Database error fetching WhatsApp account:", error);
      throw new Error("Failed to fetch WhatsApp account");
    }

    if (!accounts || accounts.length === 0) {
      return null;
    }

    const account = accounts[0] as unknown as WhatsAppAccountWithCredentials;

    console.log("✅ Account found:", {
      id: account.id,
      phone_number_id: account.phone_number_id,
      waba_id: account.waba_id,
      has_credentials: !!account.whatsapp_credentials,
    });

    console.log("🔍 Credentials data:", account.whatsapp_credentials);

    // Handle both array and object formats from Supabase
    let credentials: WhatsAppCredential;
    if (Array.isArray(account.whatsapp_credentials)) {
      console.log("📋 Credentials is an array");
      if (account.whatsapp_credentials.length === 0) {
        console.error("❌ Empty credentials array");
        throw new Error("No credentials found for WhatsApp account");
      }
      credentials = account.whatsapp_credentials[0];
    } else if (
      account.whatsapp_credentials &&
      typeof account.whatsapp_credentials === "object"
    ) {
      console.log("📦 Credentials is an object (Supabase one-to-one)");
      credentials = account.whatsapp_credentials;
    } else {
      console.error("❌ No credentials found");
      throw new Error("No credentials found for WhatsApp account");
    }

    console.log("🔐 Credentials object:", {
      account_id: credentials.account_id,
      has_encrypted_token: !!credentials.encrypted_access_token,
      has_iv: !!credentials.encryption_iv,
      has_auth_tag: !!credentials.encryption_auth_tag,
      token_expires_at: credentials.token_expires_at,
    });

    // Check if token is expired
    if (credentials.token_expires_at) {
      const expiresAt = new Date(credentials.token_expires_at);
      if (expiresAt < new Date()) {
        throw new Error("WhatsApp access token has expired");
      }
    }

    // Decrypt the access token
    const accessToken = decryptToken(
      credentials.encrypted_access_token,
      credentials.encryption_iv,
      credentials.encryption_auth_tag
    );

    return {
      accessToken,
      phoneNumberId: account.phone_number_id,
      wabaId: account.waba_id,
      businessAccountId: account.business_account_id,
      displayName: account.display_name,
      phoneNumber: account.phone_number,
      expiresAt: credentials.token_expires_at,
    };
  } catch (error) {
    console.error("Error getting WhatsApp credentials:", error);
    throw error;
  }
}

/**
 * Checks if a valid WhatsApp account is connected
 * @param userId - Optional user ID to filter accounts
 * @returns true if account exists and token is valid
 */
export async function hasValidWhatsAppAccount(
  userId?: string | null
): Promise<boolean> {
  try {
    const credentials = await getWhatsAppCredentials(userId);
    return credentials !== null;
  } catch {
    return false;
  }
}

/**
 * Gets the default API version to use
 * Falls back to env var or v24.0
 */
export function getWhatsAppApiVersion(): string {
  return process.env.WHATSAPP_GRAPH_API_VERSION || "v24.0";
}
