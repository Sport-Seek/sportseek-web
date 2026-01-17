import { apiClient } from "@/app/lib/api";

export type AuthResponse = {
  accessToken: string;
};

export type AuthUser = Record<string, unknown>;

const credentialsOptions = { credentials: "include" as const };

export const authService = {
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const payload = isEmail ? { email: identifier } : { username: identifier };

    return apiClient.post<AuthResponse>(
      "/auth/login",
      {
        ...payload,
        password,
      },
      credentialsOptions,
    );
  },

  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(
      "/auth/sign-up",
      { email, password, username },
      credentialsOptions,
    );
  },

  async fetchCurrentUser(accessToken: string): Promise<AuthUser> {
    return apiClient.get<AuthUser>("/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      ...credentialsOptions,
    });
  },

  async refreshToken(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/refresh", undefined, credentialsOptions);
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout", undefined, credentialsOptions);
  },
};
