"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
    ReactNode,
} from "react";
import { initFacebookSdk, fbLogin } from "@/lib/facebook-sdk";
import { useAuth } from "@/lib/auth-context";

interface AccountStatus {
    connected: boolean;
    account: {
        id: string;
        phone_number: string;
        phone_number_id: string;
        display_name: string;
        quality_rating: string;
        connected_at: string;
    } | null;
}

interface WhatsAppStatusContextType {
    accountStatus: AccountStatus | null;
    isLoading: boolean;
    checkingStatus: boolean; // Separate state for initial status check
    error: string | null;
    sdkReady: boolean;
    launchSignup: () => Promise<void>;
    refetch: () => Promise<void>;
}

const WhatsAppStatusContext = createContext<WhatsAppStatusContextType | undefined>(
    undefined
);

export function WhatsAppStatusProvider({ children }: { children: ReactNode }) {
    const { accessToken } = useAuth();
    const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true); // Track initial status check
    const [error, setError] = useState<string | null>(null);
    const [sdkReady, setSdkReady] = useState(false);
    const [config, setConfig] = useState<any | null>(null);
    const statusFetchedRef = useRef(false); // Use ref instead of state to avoid re-render loops

    // Fetch WhatsApp account status
    const checkStatus = useCallback(async (forceRefresh = false) => {
        try {
            console.log("[WhatsAppStatus] Checking account status...");

            if (!accessToken) {
                console.warn("[WhatsAppStatus] No access token, skipping status check");
                setAccountStatus({ connected: false, account: null });
                setCheckingStatus(false);
                // DON'T cache when there's no token - we need to re-check when token becomes available
                return;
            }

            // If already fetched this session and not forcing refresh, skip API call
            if (statusFetchedRef.current && !forceRefresh) {
                console.log("[WhatsAppStatus] ✓ Using cached status (already fetched this session)");
                setCheckingStatus(false);
                return;
            }

            setCheckingStatus(true);

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
            statusFetchedRef.current = true; // Only cache after successful API response
            console.log("[WhatsAppStatus] ✅ Status updated:", status);
        } catch (err) {
            console.error("[WhatsAppStatus] ❌ Error checking status:", err);
            setAccountStatus({ connected: false, account: null });
            statusFetchedRef.current = true; // Cache the error result too to avoid hammering the API
        } finally {
            setCheckingStatus(false);
        }
    }, [accessToken]); // Only depend on accessToken, not statusFetchedRef since it's a ref

    // Reset cache when accessToken changes (login/logout)
    useEffect(() => {
        if (accessToken && statusFetchedRef.current) {
            console.log("[WhatsAppStatus] Access token changed, invalidating cache");
            statusFetchedRef.current = false;
        }
    }, [accessToken]);

    // Initialize Facebook SDK on mount
    useEffect(() => {
        console.log("[WhatsAppStatus] Initializing Facebook SDK...");

        initFacebookSdk()
            .then(() => {
                console.log("[WhatsAppStatus] ✅ Facebook SDK ready");
                setSdkReady(true);
            })
            .catch((err) => {
                console.error("[WhatsAppStatus] ❌ Failed to initialize Facebook SDK:", err);
                setError(`Failed to load Facebook SDK: ${err?.message || "Unknown error"}`);
            });
    }, []);

    // Check account status on mount and when access token changes
    useEffect(() => {
        void checkStatus();
    }, [checkStatus]);

    // Initialize signup config
    const initializeSignup = useCallback(async () => {
        try {
            console.log("[WhatsAppStatus] Initializing signup...");
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
    }, [accessToken]);

    // Launch WhatsApp signup flow
    const launchSignup = useCallback(async () => {
        try {
            console.log("[WhatsAppStatus] Starting signup flow...");
            setIsLoading(true);
            setError(null);

            if (!sdkReady) {
                throw new Error("Facebook SDK is still loading. Please try again.");
            }

            const signupConfig = config || (await initializeSignup());

            const fbLoginCallback = async (response: any) => {
                try {
                    if (response.authResponse && response.authResponse.code) {
                        const payload = {
                            code: response.authResponse.code,
                            state: signupConfig.state,
                        };

                        const callbackResponse = await fetch("/api/whatsapp/signup/callback", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify(payload),
                        });

                        const callbackData = await callbackResponse.json();

                        if (!callbackData.success) {
                            throw new Error(callbackData.error || "Failed to complete signup");
                        }

                        // Refresh status after successful signup (force refresh)
                        statusFetchedRef.current = false; // Invalidate cache
                        await checkStatus(true);
                    } else {
                        throw new Error("Facebook auth failed - no authorization code received");
                    }
                } catch (err) {
                    console.error("[WhatsAppStatus] ❌ Error in fbLoginCallback:", err);
                    throw err;
                }
            };

            const response = await fbLogin({
                config_id: signupConfig.configId,
                response_type: "code",
                override_default_response_type: true,
                extras: {
                    setup: {},
                },
            });

            await fbLoginCallback(response);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to launch signup";
            console.error("[WhatsAppStatus] ❌ Error in launchSignup:", errorMessage);
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [config, initializeSignup, checkStatus, sdkReady, accessToken]);

    return (
        <WhatsAppStatusContext.Provider
            value={{
                accountStatus,
                isLoading,
                checkingStatus,
                error,
                sdkReady,
                launchSignup,
                refetch: () => {
                    statusFetchedRef.current = false; // Invalidate cache on manual refetch
                    return checkStatus(true);
                },
            }}
        >
            {children}
        </WhatsAppStatusContext.Provider>
    );
}

export function useWhatsAppStatus() {
    const context = useContext(WhatsAppStatusContext);
    if (!context) {
        throw new Error("useWhatsAppStatus must be used within WhatsAppStatusProvider");
    }
    return context;
}
