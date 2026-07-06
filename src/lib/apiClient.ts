import { appConfig } from "@/config";
import { refreshAccessToken } from "../services/auth/refreshService";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "../services/auth/tokenService";

/**
 * Base URL for the API.
 * Uses VITE_API_BASE_URL env variable, defaults to '' (same origin).
 */
const API_BASE_URL = appConfig.API_URL;

/**
 * Track whether a token refresh is currently in progress.
 * This prevents multiple concurrent refresh requests.
 */
let isRefreshing = false;

/**
 * Queue of requests waiting for the token refresh to complete.
 * Each entry is a pair of resolve/reject callbacks.
 */
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Optional callback invoked when both tokens are invalid
 * (refresh fails). The auth store can register this to
 * force a logout / redirect to login.
 */
let onSessionExpired: (() => void) | null = null;

/**
 * Register a callback that fires when the session is fully expired
 * (refresh token is invalid). Typically called by the auth store.
 */
export function setSessionExpiredCallback(callback: () => void): void {
  onSessionExpired = callback;
}

/**
 * Process all queued requests after a refresh attempt.
 */
function processRefreshQueue(token: string | null, error: Error | null): void {
  for (const entry of refreshQueue) {
    if (error) {
      entry.reject(error);
    } else if (token) {
      entry.resolve(token);
    }
  }
  refreshQueue = [];
}

/**
 * Custom error class for API errors.
 * Includes the HTTP status code and response body.
 */
export class ApiError extends Error {
  public status: number;
  public body: any;

  constructor(message: string, status: number, body?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * RequestConfig extends the standard RequestInit with
 * additional options for our API client.
 */
export interface RequestConfig extends Omit<RequestInit, "body"> {
  /** Skip attaching the Authorization header */
  skipAuth?: boolean;
  /** Request body (will be JSON.stringify'd if it's an object) */
  body?: any;
  /** Custom base URL override */
  baseURL?: string;
}

/**
 * Core fetch wrapper with authentication and token refresh.
 *
 * Features:
 * - Automatically attaches Bearer token from storage
 * - On 401, attempts to refresh the access token
 * - Queues concurrent requests during refresh
 * - Triggers session expired callback if refresh fails
 * - Parses JSON responses automatically
 */
async function request<T = any>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<T> {
  const {
    skipAuth = false,
    body,
    baseURL = API_BASE_URL,
    headers: customHeaders,
    ...fetchOptions
  } = config;

  // Build headers
  const headers = new Headers(customHeaders as HeadersInit);

  // Set Content-Type for JSON bodies (unless it's FormData)
  // if (body && !(body instanceof FormData)) {
  //   if (!headers.has("Content-Type")) {
  //     headers.set("Content-Type", "application/json");
  //   }
  // }

  if (
    body !== undefined &&
    !(body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  // console.log(body instanceof FormData);

  // const isMultipart =
  //   body && typeof body === "object" && "_parts" in (body as any);

  // if (!isMultipart) {
  //   headers.set("Content-Type", "application/json");
  // }

  // Attach access token if available and not skipped
  if (!skipAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  // Build the final fetch options
  const finalOptions: RequestInit = {
    ...fetchOptions,
    headers,
    body:
      body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
  };

  const url = `${baseURL}${endpoint}`;

  let response = await fetch(url, finalOptions);

  // Handle 401 — attempt token refresh
  if (response.status === 401 && !skipAuth) {
    const newToken = await handleTokenRefresh();

    if (newToken) {
      // Retry the original request with the new token
      headers.set("Authorization", `Bearer ${newToken}`);
      finalOptions.headers = headers;
      response = await fetch(url, finalOptions);
    } else {
      // Refresh failed — session expired
      if (onSessionExpired) {
        onSessionExpired();
      }
      throw new ApiError("Session expired. Please login again.", 401);
    }
  }

  // Handle non-OK responses
  if (!response.ok) {
    let errorBody: any = null;
    try {
      errorBody = await response.json();
    } catch {
      // Response body wasn't JSON
    }
    throw new ApiError(
      errorBody?.message || errorBody?.error || `HTTP ${response.status}`,
      response.status,
      errorBody,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  // Parse JSON response
  return response.json() as Promise<T>;
}

/**
 * Handle the token refresh flow.
 * If a refresh is already in progress, queue this request.
 * Otherwise, initiate a new refresh.
 */
async function handleTokenRefresh(): Promise<string | null> {
  const storedRefreshToken = getRefreshToken();

  if (!storedRefreshToken) {
    console.warn("⚠️ No refresh token available — cannot refresh");
    return null;
  }

  // If a refresh is already in progress, wait for it
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const result = await refreshAccessToken(storedRefreshToken);

    if (result) {
      // Save new tokens
      saveTokens(result.accessToken, result.refreshToken);
      console.log("✅ Token refreshed successfully");

      // Resolve all queued requests with the new token
      processRefreshQueue(result.accessToken, null);

      return result.accessToken;
    } else {
      // Refresh failed
      console.warn("❌ Token refresh failed — clearing tokens");
      clearTokens();
      processRefreshQueue(null, new Error("Token refresh failed"));
      return null;
    }
  } catch (error) {
    console.error("❌ Error during token refresh:", error);
    clearTokens();
    processRefreshQueue(
      null,
      error instanceof Error ? error : new Error("Token refresh failed"),
    );
    return null;
  } finally {
    isRefreshing = false;
  }
}

// ─── Convenience Methods ────────────────────────────────────────────────

/**
 * Perform a GET request.
 */
function get<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
  return request<T>(endpoint, { ...config, method: "GET" });
}

/**
 * Perform a POST request.
 */
function post<T = any>(
  endpoint: string,
  body?: any,
  config?: RequestConfig,
): Promise<T> {
  return request<T>(endpoint, { ...config, method: "POST", body });
}

/**
 * Perform a PUT request.
 */
function put<T = any>(
  endpoint: string,
  body?: any,
  config?: RequestConfig,
): Promise<T> {
  return request<T>(endpoint, { ...config, method: "PUT", body });
}

/**
 * Perform a PATCH request.
 */
function patch<T = any>(
  endpoint: string,
  body?: any,
  config?: RequestConfig,
): Promise<T> {
  return request<T>(endpoint, { ...config, method: "PATCH", body });
}

/**
 * Perform a DELETE request.
 */
function del<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
  return request<T>(endpoint, { ...config, method: "DELETE" });
}

/**
 * Upload a file via multipart/form-data POST.
 */
function upload<T = any>(
  endpoint: string,
  formData: FormData,
  config?: RequestConfig,
): Promise<T> {
  return request<T>(endpoint, { ...config, method: "POST", body: formData });
}

/**
 * API Client — the main export.
 *
 * Usage:
 *   import { apiClient } from '@/lib/apiClient';
 *
 *   // GET
 *   const users = await apiClient.get<User[]>('/api/users');
 *
 *   // POST
 *   const newUser = await apiClient.post<User>('/api/users', { name: 'John' });
 *
 *   // PUT
 *   await apiClient.put('/api/users/123', { name: 'Jane' });
 *
 *   // DELETE
 *   await apiClient.del('/api/users/123');
 *
 *   // Upload file
 *   const form = new FormData();
 *   form.append('file', file);
 *   await apiClient.upload('/api/upload', form);
 *
 *   // Skip auth (e.g., public endpoints)
 *   const publicData = await apiClient.get('/api/public', { skipAuth: true });
 */
export const apiClient = {
  request,
  get,
  post,
  put,
  patch,
  del,
  upload,
  setSessionExpiredCallback,
} as const;

export default apiClient;
