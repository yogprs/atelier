interface AppConfig {
  API_URL: string;
  DEFAULT_TIMEOUT: number;
  APP_ID_KEY: string;
  FCM_REGISTER_ENDPOINT: string;
  FCM_TOKEN_KEY: string;
}

export const appConfig: AppConfig = {
  API_URL: import.meta.env.VITE_API_BASE_URL ?? "localhost:3000/api",
  DEFAULT_TIMEOUT: import.meta.env.VITE_DEFAULT_TIMEOUT
    ? Number(import.meta.env.VITE_DEFAULT_TIMEOUT)
    : 15000,
  APP_ID_KEY: import.meta.env.VITE_APP_ID_KEY ?? "",
  FCM_REGISTER_ENDPOINT: import.meta.env.VITE_FCM_REGISTER_ENDPOINT ?? "",
  FCM_TOKEN_KEY: import.meta.env.VITE_FCM_TOKEN_KEY ?? "",
};
