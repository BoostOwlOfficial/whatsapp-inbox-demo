/**
 * Facebook SDK Utility
 * Following pattern from: https://innocentanyaele.medium.com/how-to-use-facebook-js-sdk-for-login-on-react-or-next-js-5b988e7971df
 */

declare global {
  interface Window {
    FB?: {
      init: (config: any) => void;
      login: (callback: (response: any) => void, options?: any) => void;
      getLoginStatus: (callback: (response: any) => void) => void;
    };
    fbAsyncInit?: () => void;
  }
}

/**
 * Initialize Facebook SDK
 * Returns a Promise that resolves when the SDK is fully loaded and initialized
 */
export const initFacebookSdk = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      console.log("[FB SDK] Initializing Facebook SDK...");

      // If already initialized, resolve immediately
      if (window.FB) {
        console.log("[FB SDK] Already initialized");
        resolve();
        return;
      }

      // Set up the async init function that FB SDK will call
      window.fbAsyncInit = () => {
        try {
          console.log("[FB SDK] fbAsyncInit callback triggered");
          window.FB!.init({
            appId:
              process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "2074250006740949",
            cookie: true,
            xfbml: true,
            version: process.env.WHATSAPP_GRAPH_API_VERSION || "v24.0",
          });

          console.log(
            "[FB SDK] ✅ Successfully initialized with appId:",
            process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "2074250006740949"
          );
          resolve();
        } catch (error) {
          console.error("[FB SDK] ❌ Error in fbAsyncInit:", error);
          reject(error);
        }
      };

      // Add timeout in case SDK fails to load
      const timeout = setTimeout(() => {
        const error = new Error("Facebook SDK failed to load after 10 seconds");
        console.error("[FB SDK] ❌ Timeout:", error.message);
        reject(error);
      }, 10000);

      // Clear timeout if SDK loads successfully
      const originalFbAsyncInit = window.fbAsyncInit;
      window.fbAsyncInit = () => {
        clearTimeout(timeout);
        originalFbAsyncInit?.();
      };
    } catch (error) {
      console.error("[FB SDK] ❌ Unexpected error in initFacebookSdk:", error);
      reject(error);
    }
  });
};

/**
 * Get Facebook login status
 * Returns a Promise with the current login status
 */
export const getFacebookLoginStatus = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      console.log("[FB SDK] Getting login status...");

      if (!window.FB) {
        const error = new Error("Facebook SDK not initialized");
        console.error("[FB SDK] ❌ Error:", error.message);
        reject(error);
        return;
      }

      window.FB.getLoginStatus((response) => {
        console.log("[FB SDK] Login status response:", response);
        resolve(response);
      });
    } catch (error) {
      console.error("[FB SDK] ❌ Error in getFacebookLoginStatus:", error);
      reject(error);
    }
  });
};

/**
 * Facebook login
 * Returns a Promise with the login response
 */
export const fbLogin = (options?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      console.log("[FB SDK] Launching Facebook login with options:", options);

      if (!window.FB) {
        const error = new Error("Facebook SDK not initialized");
        console.error("[FB SDK] ❌ Error:", error.message);
        reject(error);
        return;
      }

      window.FB.login((response) => {
        console.log("[FB SDK] Login response received:", {
          status: response.status,
          authResponse: response.authResponse ? "Present" : "Missing",
          error: response.error,
        });

        if (response.error) {
          console.error("[FB SDK] ❌ Login error:", response.error);
        }

        resolve(response);
      }, options);
    } catch (error) {
      console.error("[FB SDK] ❌ Error in fbLogin:", error);
      reject(error);
    }
  });
};
