import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { apiRequest, clearTokens, getTokens, setTokens } from "../api/client";
import type { User } from "../api/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      if (!(await getTokens())) {
        setUser(null);
        return;
      }
      const me = await apiRequest<User>("/users/me/");
      setUser(me);
    } catch {
      await clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await apiRequest<{ access: string; refresh: string }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    await setTokens(tokens);
    await refreshMe();
  }, [refreshMe]);

  const register = useCallback(async (payload: Record<string, unknown>) => {
    await apiRequest<User>("/auth/register/", { method: "POST", body: JSON.stringify(payload) });
    await login(String(payload.email), String(payload.password));
  }, [login]);

  const logout = useCallback(async () => {
    const tokens = await getTokens();
    if (tokens?.refresh) {
      await apiRequest("/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh: tokens.refresh })
      }).catch(() => undefined);
    }
    await clearTokens();
    setUser(null);
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), isLoading, login, register, logout, refreshMe }),
    [user, isLoading, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
