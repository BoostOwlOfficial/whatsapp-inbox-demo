import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-development-secret-min-32-characters-long";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "your-development-refresh-secret-min-32-characters";
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m";
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

/**
 * Generate an access token (short-lived)
 */
export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
  });
}

/**
 * Generate a refresh token (long-lived)
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
  });
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
    return decoded;
  } catch (error) {
    console.error("[JWT] Access token verification failed:", error);
    return null;
  }
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      JWT_REFRESH_SECRET
    ) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    console.error("[JWT] Refresh token verification failed:", error);
    return null;
  }
}

/**
 * Get token expiration time in seconds
 */
export function getRefreshTokenExpiry(): number {
  // Parse JWT_REFRESH_EXPIRY (e.g., "7d" -> 7 days in seconds)
  const expiry = JWT_REFRESH_EXPIRY;
  const match = expiry.match(/^(\d+)([smhd])$/);

  if (!match) return 7 * 24 * 60 * 60; // Default 7 days

  const value = parseInt(match[1]);
  const unit = match[2];
  console.log("deply again");

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 24 * 60 * 60;
    default:
      return 7 * 24 * 60 * 60;
  }
}
