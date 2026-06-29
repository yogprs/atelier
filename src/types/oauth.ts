export interface OAuthResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  redirect?: string;
  error?: string;
  message?: string;
}
