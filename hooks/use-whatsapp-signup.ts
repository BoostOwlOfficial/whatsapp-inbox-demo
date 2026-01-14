"use client";

import { useState, useCallback, useEffect } from "react";

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

declare global {
  interface Window {
    FB?: {
      init: (config: any) => void;
      login: (callback: (response: any) => void, options?: any) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export function useWhatsAppSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(
    null
  );
  const [config, setConfig] = useState<SignupConfig | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/whatsapp/signup/status");
      const data = await response.json();

      if (data.success) {
        setAccountStatus({
          connected: data.connected,
          account: data.account,
        });
      }
    } catch (err) {
      console.error("Error checking status:", err);
    }
  }, []);

  // Check account status on mount
  useEffect(() => {
    void checkStatus();
  }, [checkStatus]);

  const initializeSignup = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/whatsapp/signup/initiate", {
        method: "POST",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to initialize signup");
      }

      setConfig(data.config);
      return data.config;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize signup";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const launchSignup = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize if not already done
      const signupConfig = config || (await initializeSignup());

      // Launch Facebook Embedded Signup
      return new Promise((resolve, reject) => {
        if (!window.FB) {
          reject(new Error("Facebook SDK not loaded"));
          return;
        }

        // Facebook embedded signup response handler
        const fbLoginCallback = async (response: any) => {
          try {
            if (response.authResponse) {
              const { code, accessToken } = response.authResponse;

              // Send to our callback endpoint
              const callbackResponse = await fetch(
                "/api/whatsapp/signup/callback",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    code,
                    accessToken:
                      accessToken || response.authResponse.access_token,
                    wabaId: response.authResponse.granted_scopes?.includes(
                      "whatsapp_business_management"
                    )
                      ? response.authResponse.userID
                      : undefined,
                    phoneNumberId:
                      response.authResponse.data_access_expiration_time,
                    businessAccountId: response.authResponse.graphDomain,
                    state: signupConfig.state,
                  }),
                }
              );

              const callbackData = await callbackResponse.json();

              if (!callbackData.success) {
                throw new Error(
                  callbackData.error || "Failed to complete signup"
                );
              }

              // Refresh status
              await checkStatus();
              resolve(callbackData.account);
            } else {
              reject(new Error("Facebook auth failed"));
            }
          } catch (err) {
            reject(err);
          } finally {
            setIsLoading(false);
          }
        };

        // Launch Facebook login dialog with WhatsApp permissions
        window.FB.login(fbLoginCallback, {
          config_id: signupConfig.configId,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {
              // This will trigger the embedded signup flow
            },
          },
        });
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to launch signup";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, [config, initializeSignup, checkStatus]);

  return {
    isLoading,
    error,
    accountStatus,
    launchSignup,
    checkStatus,
  };
}
