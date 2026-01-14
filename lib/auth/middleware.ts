import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, type AccessTokenPayload } from "./jwt";

export interface AuthenticatedRequest extends NextRequest {
  user?: AccessTokenPayload;
}

/**
 * Middleware to verify JWT token and attach user to request
 * Usage: Apply to API routes that require authentication
 */
export async function requireAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Attach user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = payload;

    // Call the actual handler
    return await handler(authenticatedRequest);
  } catch (error) {
    console.error("[Auth Middleware] Error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 401 }
    );
  }
}

/**
 * Extract user from request (for authenticated routes)
 */
export function getUser(
  request: AuthenticatedRequest
): AccessTokenPayload | null {
  return request.user || null;
}
