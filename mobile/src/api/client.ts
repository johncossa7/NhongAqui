import * as SecureStore from "expo-secure-store";

import type { Paginated } from "./types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const ACCESS_KEY = "nhongaqui.access";
const REFRESH_KEY = "nhongaqui.refresh";

export async function getTokens() {
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY)
  ]);
  return access && refresh ? { access, refresh } : null;
}

export async function setTokens(tokens: { access: string; refresh: string }) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, tokens.access),
    SecureStore.setItemAsync(REFRESH_KEY, tokens.refresh)
  ]);
}

export async function clearTokens() {
  await Promise.all([SecureStore.deleteItemAsync(ACCESS_KEY), SecureStore.deleteItemAsync(REFRESH_KEY)]);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const tokens = await getTokens();
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (tokens?.access) headers.set("Authorization", `Bearer ${tokens.access}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(payload.detail ?? JSON.stringify(payload));
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
