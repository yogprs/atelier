/**
 * User information extracted from JWT claims.
 * Matches the backend's user_info structure.
 */
export interface UserInfo {
  user_id: string;
  email: string;
  username: string;
}

/**
 * Represents an authenticated session with tokens and user data.
 */
export interface AuthSession {
  accessToken: string;
  refreshToken: string | null;
  user: UserInfo;
}

/**
 * Auth context/store type definition.
 */
export interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  login: (accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Response shape from the backend's refresh endpoint.
 * Backend sends: { token: "...", refresh_token: "..." }
 */
export interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
}

/**
 * Generic API response wrapper.
 */
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}
