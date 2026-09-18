import * as SecureStore from "expo-secure-store";

import type { Paginated } from "./types";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const ACCESS_KEY = "nhongaqui.access";
const REFRESH_KEY = "nhongaqui.refresh";
const REQUEST_TIMEOUT_MS = 15000;

type Tokens = { access: string; refresh: string };
let refreshPromise: Promise<Tokens | null> | null = null;

export async function getTokens() {
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY)
  ]);
  return access && refresh ? { access, refresh } : null;
}

export async function setTokens(tokens: Tokens) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, tokens.access),
    SecureStore.setItemAsync(REFRESH_KEY, tokens.refresh)
  ]);
}

export async function clearTokens() {
  await Promise.all([SecureStore.deleteItemAsync(ACCESS_KEY), SecureStore.deleteItemAsync(REFRESH_KEY)]);
}

function formatApiError(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return "Nao foi possivel completar o pedido.";
  const data = payload as Record<string, unknown>;
  if (typeof data.detail === "string") return data.detail;
  return Object.entries(data)
    .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(" ") : String(value)}`)
    .join(" ");
}

async function refreshTokens(tokens: Tokens): Promise<Tokens | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: tokens.refresh })
        });
        if (!response.ok) throw new Error("Sessao expirada.");
        const payload = await response.json() as { access: string; refresh?: string };
        const next = { access: payload.access, refresh: payload.refresh ?? tokens.refresh };
        await setTokens(next);
        return next;
      } catch {
        await clearTokens();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let tokens = await getTokens();
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (tokens?.access) headers.set("Authorization", `Bearer ${tokens.access}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal
    });
    if (response.status === 401 && tokens?.refresh && path !== "/auth/refresh/") {
      tokens = await refreshTokens(tokens);
      if (tokens) {
        headers.set("Authorization", `Bearer ${tokens.access}`);
        response = await fetch(`${API_URL}${path}`, {
          ...options,
          headers,
          signal: options.signal ?? controller.signal
        });
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("A ligacao demorou demasiado. Verifique a internet e tente novamente.");
    }
    throw new Error("Nao foi possivel ligar ao NhongAqui. Verifique a internet.");
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(formatApiError(payload));
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function normalizePage<T>(data: Paginated<T> | T[]) {
  return Array.isArray(data) ? data : data.results;
}

export function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}
