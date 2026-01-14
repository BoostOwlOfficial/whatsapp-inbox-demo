"use client";

import { useState, useCallback, useEffect } from "react";
import { initFacebookSdk, fbLogin } from "@/lib/facebook-sdk";
import { useAuth } from "@/lib/auth-context";

interface SignupConfig {
  appId: string;
  configId: string;
  redirectUrl: string;
  state: string;
}

interface AccountStatus {
  connected: boolean;
  account: {
    id: string;
    phone_number: string;
    display_name: string;
    quality_rating: string;
    connected_at: string;
  } | null;
}

interface SignupResponse {
  code: string;
  accessToken?: string;
  wabaId?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
}

export function useWhatsAppSignup() {
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(
    null
  );
  const [config, setConfig] = useState<SignupConfig | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      console.log("[WhatsApp Signup] Checking account status...");

      if (!accessToken) {
        console.warn(
          "[WhatsApp Signup] No access token, skipping status check"
        );
        setAccountStatus({ connected: false, account: null });
        return;
      }

      const response = await fetch("/api/whatsapp/signup/status", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check status: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to check account status");
      }

      const status: AccountStatus = {
        connected: data.connected,
        account: data.account,
      };

      setAccountStatus(status);
      console.log("[WhatsApp Signup] Status:", status);
    } catch (err) {
      console.error("[WhatsApp Signup] ❌ Error checking status:", err);
    }
  }, [accessToken]);

  // Initialize Facebook SDK on mount
  useEffect(() => {
    console.log("[WhatsApp Signup] Initializing Facebook SDK...");

    initFacebookSdk()
      .then(() => {
        console.log("[WhatsApp Signup] ✅ Facebook SDK ready");
        setSdkReady(true);
      })
      .catch((err) => {
        console.error(
          "[WhatsApp Signup] ❌ Failed to initialize Facebook SDK:",
          err
        );
        console.error("[WhatsApp Signup] Error details:", {
          name: err?.name,
          message: err?.message,
          stack: err?.stack,
        });
        setError(
          `Failed to load Facebook SDK: ${err?.message || "Unknown error"}`
        );
      });
  }, []);

  // Check account status on mount
  useEffect(() => {
    void checkStatus();
  }, [checkStatus]);

  const initializeSignup = useCallback(async () => {
    try {
      console.log("[WhatsApp Signup] Initializing signup...");
      setIsLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/whatsapp/signup/initiate", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        method: "POST",
      });

      const data = await response.json();
      console.log("[WhatsApp Signup] Initialize response:", data);

      if (!data.success) {
        const error = new Error(data.error || "Failed to initialize signup");
        console.error("[WhatsApp Signup] ❌ Initialize failed:", error.message);
        throw error;
      }

      setConfig(data.config);
      console.log("[WhatsApp Signup] ✅ Signup initialized successfully");
      return data.config;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize signup";
      console.error("[WhatsApp Signup] ❌ Error in initializeSignup:", err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const launchSignup = useCallback(async () => {
    try {
      console.log("[WhatsApp Signup] Starting signup flow...");
      setIsLoading(true);
      setError(null);

      // Check SDK is ready
      if (!sdkReady) {
        const error = new Error(
          "Facebook SDK is still loading. Please try again."
        );
        console.error("[WhatsApp Signup] ❌ SDK not ready");
        throw error;
      }

      // Initialize if not already done
      console.log("[WhatsApp Signup] Initializing signup config...");
      const signupConfig = config || (await initializeSignup());
      console.log("[WhatsApp Signup] Config received:", {
        appId: signupConfig.appId,
        configId: signupConfig.configId,
        hasState: !!signupConfig.state,
      });

      // Facebook embedded signup response handler
      const fbLoginCallback = async (response: any) => {
        try {
          console.log("[WhatsApp Signup] Processing Facebook response...");
          console.log(
            "[WhatsApp Signup] Full response:",
            JSON.stringify(response, null, 2)
          );

          if (response.authResponse && response.authResponse.code) {
            console.log(
              "[WhatsApp Signup] ✅ Auth response with code received"
            );

            // Get user ID from config (set by backend via JWT)
            const userId = signupConfig.userId;
            console.log("[WhatsApp Signup] User ID:", userId);

            const payload = {
              code: response.authResponse.code,
              state: signupConfig.state,
              userId,
            };

            console.log(
              "[WhatsApp Signup] Sending payload to backend:",
              payload
            );

            // Send to our callback endpoint - backend will handle token exchange
            const callbackResponse = await fetch(
              "/api/whatsapp/signup/callback",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              }
            );

            const callbackData = await callbackResponse.json();
            console.log("[WhatsApp Signup] Callback response:", callbackData);

            if (!callbackData.success) {
              const error = new Error(
                callbackData.error || "Failed to complete signup"
              );
              console.error(
                "[WhatsApp Signup] ❌ Callback failed:",
                error.message
              );
              throw error;
            }

            // Refresh status
            console.log(
              "[WhatsApp Signup] ✅ Signup successful, refreshing status..."
            );
            await checkStatus();
          } else {
            const error = new Error(
              "Facebook auth failed - no authorization code received"
            );
            console.error("[WhatsApp Signup] ❌", error.message);
            console.error("[WhatsApp Signup] Response received:", response);
            throw error;
          }
        } catch (err) {
          console.error("[WhatsApp Signup] ❌ Error in fbLoginCallback:", err);
          throw err;
        }
      };

      // Launch Facebook login using the utility function
      console.log("[WhatsApp Signup] Launching Facebook login dialog...");
      const response = await fbLogin({
        config_id: signupConfig.configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {
            // This will trigger the embedded signup flow
          },
        },
      });

      // Handle the response
      await fbLoginCallback(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to launch signup";
      console.error(
        "[WhatsApp Signup] ❌ Error in launchSignup:",
        errorMessage
      );
      console.error("[WhatsApp Signup] Full error:", err);
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, [config, initializeSignup, checkStatus, sdkReady]);

  return {
    isLoading,
    error,
    accountStatus,
    launchSignup,
    checkStatus,
    sdkReady,
  };
}
