export type OAuthProvider = "google" | "github";

/** Response from POST /api/auth/exchange. */
export interface OAuthExchangeResponse {
  token: string;
  refresh_token: string;
  user_id: string;
}

export type OAuthErrorCode =
  | "missing_code"
  | "email_not_verified"
  | "oauth_failed"
  | "oauth_unavailable"
  | "access_denied"
  | "invalid_code"
  | "invalid_platform"
  | "invalid_request"
  | "oauth_redirect_failed"
  | "exchange_failed";
