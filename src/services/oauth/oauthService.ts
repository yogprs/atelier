import { appConfig } from "@/config";
import apiClient, { ApiError } from "@/lib/apiClient";
import type { OAuthExchangeResponse, OAuthProvider } from "@/types/oauth";

const OAUTH_ORIGIN = appConfig.API_ORIGIN;

/**
 * Start the web OAuth flow.
 *
 * The backend answers with a 302 to the provider, so this has to be a full
 * browser navigation. Calling it with fetch would only follow the redirect
 * cross-origin and fail.
 */
export function startOAuth(provider: OAuthProvider): void {
  // The backend treats a missing platform as the mobile app, so web must
  // always send platform=web explicitly. Because this is a full navigation,
  // a misconfigured server that answers 400 invalid_platform is rendered by
  // the browser; the app itself never sends another platform value.
  window.location.assign(`${OAUTH_ORIGIN}/api/auth/${provider}?platform=web`);
}

/**
 * Exchange the one-time code returned on /auth/callback for a session.
 * The endpoint is public, so no Authorization header is attached.
 */
export async function exchangeOAuthCode(
  code: string,
): Promise<OAuthExchangeResponse> {
  return apiClient.post<OAuthExchangeResponse>(
    "/api/auth/exchange",
    { code },
    { skipAuth: true, baseURL: OAUTH_ORIGIN },
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: "The provider did not return a sign-in code. Please try again.",
  email_not_verified:
    "Your provider email is not verified. Verify it, then sign in again.",
  oauth_failed: "Sign-in with the provider failed. Please try again.",
  oauth_unavailable:
    "Sign-in is temporarily unavailable. Please try again later.",
  access_denied: "Sign-in was cancelled.",
  invalid_code:
    "This sign-in link has expired or was already used. Please sign in again.",
  invalid_platform: "This sign-in request is not supported by the server.",
  invalid_request: "The sign-in request was invalid. Please try again.",
  oauth_redirect_failed:
    "Web sign-in is not configured on the server yet. Please contact support.",
  exchange_failed: "Sign-in failed. Please try again.",
};

/**
 * Turn an OAuth error code into a message safe to show to the user.
 * Unknown provider errors fall back to the server message, then a generic one.
 */
export function oauthErrorMessage(
  code?: string | null,
  message?: string | null,
): string {
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (message && message.trim()) return message.trim();
  return ERROR_MESSAGES.exchange_failed;
}

/** Read the backend error code/message from a failed exchange request. */
export function oauthErrorFrom(error: unknown): {
  code: string;
  message?: string;
} {
  if (error instanceof ApiError) {
    const body = error.body as { error?: string; message?: string } | null;
    return {
      code: body?.error ?? "exchange_failed",
      message: body?.message ?? error.message,
    };
  }

  return {
    code: "exchange_failed",
    message: error instanceof Error ? error.message : undefined,
  };
}
