import { appConfig } from "@/config";
import type { RefreshTokenResponse } from "../../types/general";

/**
 * Base URL for the API.
 * Uses env variable, defaults to '' (same origin).
 */
const API_BASE_URL = appConfig.API_URL;

/**
 * Call the backend's refresh endpoint to get a new access token.
 *
 * Backend endpoint: POST /api/users/refresh
 * Request body: { refresh_token: "..." }
 * Response body: { token: "...", refresh_token: "..." }
 *
 * Uses raw fetch instead of apiClient to avoid circular dependency
 * (apiClient uses this service for token refresh).
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
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
