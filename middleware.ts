import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const publicPaths = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/whatsapp/webhook", // Must be public for Meta verification
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow static files and next internal paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // file extensions like .ico, .png
  ) {
    return NextResponse.next();
  }

  // Check for refresh token in cookies
  // This is our main indicator of a generic "logged in" state for the middleware
  // The actual access token validation happens in API routes/components
  const hasRefreshToken = request.cookies.has("refreshToken");

  if (!hasRefreshToken) {
    // Redirect to login if not authenticated
    const loginUrl = new URL("/login", request.url);
    // Optional: Add return URL
    // loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - api/webhook (WhatsApp webhook - uses signature verification)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|api/webhook|_next/static|_next/image|favicon.ico).*)",
  ],
};
