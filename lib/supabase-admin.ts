import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Service role client for backend operations (bypasses RLS)
 *
 * CRITICAL SECURITY NOTES:
 * - This client bypasses ALL Row Level Security policies
 * - ONLY use in server-side API routes
 * - NEVER import this file in client-side components
 * - NEVER expose the service role key to the client
 *
 * This file should only be imported in:
 * - app/api/... route handlers
 * - Server-side functions
 */
// Custom fetch implementation for serverless environments
// Fixes "SocketError: other side closed" by disabling keep-alive
const customFetch = (url: RequestInfo | URL, options: any) => {
  return fetch(url as any, {
    ...options,
    headers: {
      ...options?.headers,
      Connection: "close",
    },
    // @ts-ignore - undici/node-fetch support keepalive: false via agent or explicit option in some versions
    // For Vercel/Node 18, forcing Connection header is key
    keepalive: false,
  });
};

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: customFetch,
  },
});

// Helper to check if service role key is configured
export function isAdminConfigured(): boolean {
  return !!supabaseServiceRoleKey && supabaseServiceRoleKey !== "";
}
