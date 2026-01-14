"use client";

import { useState, useCallback, useEffect } from "react";
import { initFacebookSdk, fbLogin } from "@/lib/facebook-sdk";

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
      const response = await fetch("/api/whatsapp/signup/status");
      const data = await response.json();

      console.log("[WhatsApp Signup] Status response:", data);

      if (data.success) {
        setAccountStatus({
          connected: data.connected,
          account: data.account,
        });
        console.log(
          "[WhatsApp Signup] Account status updated:",
          data.connected ? "Connected" : "Not connected"
        );
      } else {
        console.warn(
          "[WhatsApp Signup] ⚠️ Status check returned success=false"
        );
      }
    } catch (err) {
      console.error("[WhatsApp Signup] ❌ Error checking status:", err);
    }
  }, []);

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

      const response = await fetch("/api/whatsapp/signup/initiate", {
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
            "[WhatsApp Signup] Full response object:",
            JSON.stringify(response, null, 2)
          );

          if (response.authResponse) {
            console.log("[WhatsApp Signup] ✅ Auth response received");
            console.log(
              "[WhatsApp Signup] authResponse details:",
              JSON.stringify(response.authResponse, null, 2)
            );

            const { code, accessToken } = response.authResponse;

            console.log("[WhatsApp Signup] Extracted values:", {
              code: code || "MISSING",
              accessToken: accessToken || "MISSING",
              access_token: response.authResponse.access_token || "MISSING",
              granted_scopes: response.authResponse.granted_scopes,
              userID: response.authResponse.userID,
              data_access_expiration_time:
                response.authResponse.data_access_expiration_time,
              graphDomain: response.authResponse.graphDomain,
              allKeys: Object.keys(response.authResponse),
            });

            // Send to our callback endpoint
            console.log("[WhatsApp Signup] Sending to callback endpoint...");

            const payload = {
              code: code || response.authResponse.code,
              accessToken: accessToken || response.authResponse.access_token,
              wabaId: response.authResponse.granted_scopes?.includes(
                "whatsapp_business_management"
              )
                ? response.authResponse.userID
                : undefined,
              phoneNumberId: response.authResponse.data_access_expiration_time,
              businessAccountId: response.authResponse.graphDomain,
              state: signupConfig.state,
            };

            console.log(
              "[WhatsApp Signup] Sending payload:",
              JSON.stringify(payload, null, 2)
            );

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
            const error = new Error("Facebook auth failed - no auth response");
            console.error("[WhatsApp Signup] ❌", error.message);
            console.error("[WhatsApp Signup] Full response:", response);
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
