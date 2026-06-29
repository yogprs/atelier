import type { UserInfo } from '../types/general';

/**
 * Decode a JWT payload without verifying the signature.
 * This is safe on the client because the backend already verified it.
 * We only need to read the claims (user_id, user_info, exp, etc.)
 */
export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('⚠️ Invalid JWT format (expected 3 parts)');
      return null;
    }

    // Base64url → Base64 → decode
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('❌ Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Extract UserInfo from JWT claims.
 * Matches the backend's JWT structure:
 * {
 *   "user_id": "abc123",
 *   "user_info": { "UserID": "abc123", "Email": "...", "Username": "..." },
 *   "exp": 1234567890
 * }
 */
export function extractUserInfo(token: string): UserInfo | null {
  const claims = decodeJwtPayload(token);
  if (!claims) return null;

  // The backend stores user_info with capitalized keys
  const userInfo = claims.user_info;
  if (!userInfo) {
    console.warn('⚠️ No user_info claim found in JWT');
    return null;
  }

  return {
    user_id: userInfo.UserID || userInfo.user_id || claims.user_id || '',
    email: userInfo.Email || userInfo.email || '',
    username: userInfo.Username || userInfo.username || '',
  };
}

/**
 * Check if a JWT token is expired.
 * Returns true if the token is expired or cannot be decoded.
 */
export function isTokenExpired(token: string): boolean {
  const claims = decodeJwtPayload(token);
  if (!claims?.exp) return true;
  return claims.exp * 1000 < Date.now();
}
