import { appConfig } from "@/config";

const API_BASE_URL = appConfig.API_URL;

/**
 * Opens the browser to your backend's OAuth endpoint.
 * The backend handles the full OAuth flow with GitHub/Google,
 * then redirects back to the app via deep link with tokens.
 *
 * Flow:
 * 1. App opens browser → https://madgo.my.id/api/auth/github
 * 2. Backend redirects browser → GitHub login page
 * 3. User signs in on GitHub
 * 4. GitHub redirects → https://madgo.my.id/api/auth/github/callback?code=...
 * 5. Backend exchanges code for tokens, creates/finds user, generates JWT
 * 6. Backend redirects browser → /auth/callback?token=...&refresh_token=...&redirect=...
 * 7. App catches the deep link and this function returns the tokens
 */
export function handleAuthWithProvider(provider: "github" | "google") {
  // Just hit the backend endpoint — it handles client ID, redirect to GitHub/Google, and callback
  // window.location.href = `${API_BASE_URL}/auth/${provider}`;
  window.open(`${API_BASE_URL}/auth/${provider}`, "_blank");
}
