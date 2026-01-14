"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    FB?: {
      init: (config: any) => void;
      login: (callback: (response: any) => void, options?: any) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export function useFacebookSDK() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSDKError] = useState<string | null>(null);

  useEffect(() => {
    // Check if SDK is already loaded
    if (window.FB) {
      setSdkLoaded(true);
      return;
    }

    // Wait for SDK to load via the script in layout.tsx
    const checkSDK = setInterval(() => {
      if (window.FB) {
        setSdkLoaded(true);
        clearInterval(checkSDK);
      }
    }, 100);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      if (!window.FB) {
        setSDKError("Facebook SDK failed to load");
        clearInterval(checkSDK);
      }
    }, 10000);

    return () => {
      clearInterval(checkSDK);
      clearTimeout(timeout);
    };
  }, []);

  return { sdkLoaded, sdkError, FB: window.FB };
}
