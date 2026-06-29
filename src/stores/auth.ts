import { defineStore } from "pinia";
import { setSessionExpiredCallback } from "../lib/apiClient";
import { refreshAccessToken } from "../services/auth/refreshService";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "../services/auth/tokenService";
import type { AuthSession } from "../types/general";
import { decodeJwtPayload, extractUserInfo } from "../utils/jwt";

interface AuthState {
  session: AuthSession | null;
  loading: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    session: null,
    loading: true,
  }),

  getters: {
    isAuthenticated: (state) => !!state.session,

    user: (state) => state.session?.user ?? null,

    accessToken: (state) => state.session?.accessToken ?? null,
  },

  actions: {
    /**
     * Restore session from stored tokens on app startup.
     * If the access token is expired, attempts to refresh it.
     */
    async restoreSession(): Promise<void> {
      try {
        let accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        if (!accessToken) {
          console.log("🔓 No stored token — user needs to login");
          this.session = null;
          return;
        }

        // Check if the access token is expired
        const claims = decodeJwtPayload(accessToken);
        // const isExpired = claims?.exp && claims.exp * 1000 < Date.now();
        const isExpired =
          claims?.exp && claims.exp * 1000 < Date.now() + 30_000;

        if (isExpired && refreshToken) {
          console.log(
            "🔄 Access token expired on startup — attempting refresh...",
          );
          const result = await refreshAccessToken(refreshToken);

          if (result) {
            saveTokens(result.accessToken, result.refreshToken);
            accessToken = result.accessToken;
            console.log("✅ Token refreshed on startup");
          } else {
            console.warn(
              "❌ Token refresh failed on startup — clearing session",
            );
            clearTokens();
            this.session = null;
            return;
          }
        } else if (isExpired && !refreshToken) {
          console.warn(
            "⚠️ Token expired and no refresh token — clearing session",
          );
          clearTokens();
          this.session = null;
          return;
        }

        const userInfo = extractUserInfo(accessToken);
        if (!userInfo) {
          console.warn("⚠️ Could not decode user info from token");
          clearTokens();
          this.session = null;
          return;
        }

        console.log(
          "🔐 Session restored for:",
          userInfo.username || userInfo.email,
        );

        this.session = {
          accessToken,
          refreshToken,
          user: userInfo,
        };
      } catch (error) {
        console.error("❌ Error restoring session:", error);
        clearTokens();
        this.session = null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Call after successful login.
     * Saves tokens, decodes JWT, and sets session state.
     *
     * @param accessToken - The access token from the backend (field: "token")
     * @param refreshToken - The refresh token from the backend (field: "refresh_token")
     */
    async login(accessToken: string, refreshToken?: string): Promise<void> {
      // Save to storage
      saveTokens(accessToken, refreshToken);

      // Decode user info from JWT
      const userInfo = extractUserInfo(accessToken);
      if (!userInfo) {
        throw new Error("Could not decode user info from token");
      }

      console.log("🔐 Logged in as:", userInfo.username || userInfo.email);
      this.session = {
        accessToken,
        refreshToken: refreshToken || null,
        user: userInfo,
      };
    },

    /**
     * Clear all tokens and reset session.
     */
    async logout(): Promise<void> {
      clearTokens();
      this.session = null;
      console.log("🔓 Logged out");
    },

    /**
     * Initialize the auth store.
     * Restores session and registers the session-expired callback
     * so the apiClient can force a logout on 401 refresh failure.
     */
    async init(): Promise<void> {
      // Register session expired handler
      setSessionExpiredCallback(async () => {
        console.warn("🔒 Session expired — forcing logout");
        await this.logout();
      });

      await this.restoreSession();
    },
  },
});
