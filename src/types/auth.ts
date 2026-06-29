export interface BodyLogin {
  email: string;
  password: string;
}

export interface LoginResponse {
  refresh_token: string;
  token: string;
}
