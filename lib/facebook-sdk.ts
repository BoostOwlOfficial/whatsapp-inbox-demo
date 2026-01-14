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

      // If SDK is already loaded AND initialized, resolve immediately
      if (window.FB && typeof window.FB.init === "function") {
        console.log("[FB SDK] SDK already loaded, checking if initialized...");

        // Try to call init - if it throws, SDK wasn't initialized properly
        try {
          window.FB.init({
            appId: "2074250006740949",
            cookie: true,
            xfbml: true,
            version: "v24.0",
          });
          console.log(
            "[FB SDK] ✅ Successfully initialized (SDK was pre-loaded)"
          );
          resolve();
          return;
        } catch (err) {
          console.log(
            "[FB SDK] SDK loaded but init failed, will retry via fbAsyncInit"
          );
        }
      }

      // Set up timeout
      const timeout = setTimeout(() => {
        const error = new Error("Facebook SDK failed to load after 10 seconds");
        console.error("[FB SDK] ❌ Timeout:", error.message);
        reject(error);
      }, 10000);

      // Set up the async init function that FB SDK will call
      window.fbAsyncInit = () => {
        try {
          console.log("[FB SDK] fbAsyncInit callback triggered");
          clearTimeout(timeout);

          window.FB!.init({
            appId: "2074250006740949",
            cookie: true,
            xfbml: true,
            version: "v24.0",
          });

          console.log("[FB SDK] ✅ Successfully initialized via fbAsyncInit");
          resolve();
        } catch (error) {
          console.error("[FB SDK] ❌ Error in fbAsyncInit:", error);
          clearTimeout(timeout);
          reject(error);
        }
      };

      // If SDK is already loaded (script tag executed before our code), call fbAsyncInit manually
      if (window.FB) {
        console.log("[FB SDK] SDK detected, calling fbAsyncInit manually");
        window.fbAsyncInit();
      }
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
