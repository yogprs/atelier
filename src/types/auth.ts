export interface BodyLogin {
  email: string;
  password: string;
}

export interface LoginResponse {
  refresh_token: string;
  token: string;
}

export interface BodyRegister {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message?: string;
  token?: string;
  refresh_token?: string;
}
