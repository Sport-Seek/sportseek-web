"use client";

import { ApiError } from "@/app/lib/api";
import { authService, AuthUser } from "@/app/services/auth.service";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AuthContextType = {
  user: AuthUser | null;
  accessToken: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: (options?: { immediate?: boolean }) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  refresh: () => Promise<string | null>;
  fetchUser: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = "sportseek_access_token";
let logoutInProgress = false;

const readStoredToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const persistToken = (token: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (token) {
      window.localStorage.setItem(STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage failures should not block auth flows.
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthState = useCallback(() => {
    persistToken(null);
    setUser(null);
    setAccessToken(null);
  }, []);

  const logout = useCallback(
    async (options?: { immediate?: boolean }) => {
      if (logoutInProgress) {
        return;
      }

      const immediate = options?.immediate ?? false;
      logoutInProgress = true;

      try {
        if (immediate) {
          clearAuthState();
          authService.logout().catch(() => undefined);
          return;
        }

        try {
          await authService.logout();
        } catch {
          // Ignore server logout errors.
        }

        clearAuthState();
      } finally {
        logoutInProgress = false;
      }
    },
    [clearAuthState],
  );

  const fetchUser = useCallback(
    async (token: string) => {
      try {
        const account = await authService.fetchCurrentUser(token);
        setUser(account);
      } catch {
        await logout();
      }
    },
    [logout],
  );

  const login = useCallback(
    async (identifier: string, password: string) => {
      const response = await authService.login(identifier, password);
      const token = response.accessToken;

      persistToken(token);
      setAccessToken(token);
      await fetchUser(token);
    },
    [fetchUser],
  );

  const register = useCallback(
    async (email: string, password: string, username: string) => {
      const response = await authService.register(email, password, username);
      const token = response.accessToken;

      persistToken(token);
      setAccessToken(token);
      await fetchUser(token);
    },
    [fetchUser],
  );

  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      const response = await authService.refreshToken();
      const token = response.accessToken;

      persistToken(token);
      setAccessToken(token);
      return token;
    } catch (error) {
      const isForbidden = error instanceof ApiError && error.status === 403;
      if (isForbidden) {
        await logout({ immediate: true });
      } else {
        await logout();
      }
      return null;
    }
  }, [logout]);

  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = readStoredToken();
        if (storedToken) {
          setAccessToken(storedToken);
          await fetchUser(storedToken);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [fetchUser]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      login,
      register,
      logout,
      isAuthenticated: !!accessToken,
      loading,
      refresh,
      fetchUser,
    }),
    [accessToken, fetchUser, loading, login, logout, refresh, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
