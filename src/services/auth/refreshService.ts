import { appConfig } from "@/config";
import type { RefreshTokenResponse } from "../../types/general";

/** Refresh lives at the API origin, outside the /api base used by REST calls. */
const REFRESH_URL = `${appConfig.API_ORIGIN}/api/users/refresh`;

/**
 * Call the backend's refresh endpoint to get a new access token.
 *
 * Backend endpoint: GET /api/users/refresh
 * Authorization: Bearer <refresh_token>
 * Response body: { token: "...", refresh_token: "..." }
 *
 * Uses raw fetch instead of apiClient to avoid circular dependency
 * (apiClient uses this service for token refresh).
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await fetch(REFRESH_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      console.warn(
        `❌ Refresh token request failed with status: ${response.status}`,
      );
      return null;
    }

    const data: RefreshTokenResponse = await response.json();

    if (!data.token) {
      console.warn("❌ Refresh response missing access token");
      return null;
    }

    return {
      accessToken: data.token,
      refreshToken: data.refresh_token || refreshToken,
    };
  } catch (error) {
    console.error("❌ Error refreshing access token:", error);
    return null;
  }
}
