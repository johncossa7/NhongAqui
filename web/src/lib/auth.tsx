import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { apiRequest, clearTokens, getTokens, setTokens } from "./api";
import type { User } from "../types";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  refreshMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refreshMe = useCallback(async () => {
    if (!getTokens()) {
      setUser(null);
      return;
    }
    try {
      const me = await apiRequest<User>("/users/me/");
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await apiRequest<{ access: string; refresh: string }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    setTokens(tokens);
    await refreshMe();
  }, [refreshMe]);

  const register = useCallback(async (payload: Record<string, unknown>) => {
    await apiRequest<User>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    await login(String(payload.email), String(payload.password));
  }, [login]);

  const logout = useCallback(async () => {
    const tokens = getTokens();
    if (tokens?.refresh) {
      await apiRequest<void>("/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh: tokens.refresh })
      }).catch(() => undefined);
    }
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      refreshMe,
      login,
      register,
      logout
    }),
    [user, refreshMe, login, register, logout]
  );

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
