interface AppConfig {
  API_URL: string;
  API_ORIGIN: string;
  DEFAULT_TIMEOUT: number;
  APP_ID_KEY: string;
  FCM_REGISTER_ENDPOINT: string;
  FCM_TOKEN_KEY: string;
}

const rawBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

// REST routes all live under /api. Accept either the host root or the
// already-suffixed host/api form in env so both old and new setups work.
const apiUrl = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl}/api`;

// OAuth and token refresh live at the API origin, not under the versioned
// base path. Accept either "https://host" or "https://host/api" from env.
const rawApiOrigin = (import.meta.env.VITE_API_ORIGIN as string | undefined)?.replace(
  /\/+$/,
  "",
);

export const appConfig: AppConfig = {
  API_URL: apiUrl,
  API_ORIGIN: rawApiOrigin || apiUrl.replace(/\/api$/, ""),
  DEFAULT_TIMEOUT: import.meta.env.VITE_DEFAULT_TIMEOUT
    ? Number(import.meta.env.VITE_DEFAULT_TIMEOUT)
    : 15000,
  APP_ID_KEY: import.meta.env.VITE_APP_ID_KEY ?? "",
  FCM_REGISTER_ENDPOINT: import.meta.env.VITE_FCM_REGISTER_ENDPOINT ?? "",
  FCM_TOKEN_KEY: import.meta.env.VITE_FCM_TOKEN_KEY ?? "",
};
