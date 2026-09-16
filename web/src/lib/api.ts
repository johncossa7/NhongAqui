import type { Paginated } from "../types";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";
const REQUEST_TIMEOUT_MS = 12000;

type Tokens = {
  access: string;
  refresh: string;
};

const ACCESS_KEY = "nhongaqui.access";
const REFRESH_KEY = "nhongaqui.refresh";

const fieldLabels: Record<string, string> = {
  email: "Email",
  password: "Palavra-passe",
  first_name: "Nome",
  last_name: "Apelido",
  phone: "Telefone",
  city: "Cidade",
  non_field_errors: "Erro"
};

function formatApiError(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }
  if (!payload || typeof payload !== "object") {
    return "Nao foi possivel completar o pedido.";
  }

  const data = payload as Record<string, unknown>;
  if (typeof data.detail === "string") {
    return data.detail;
  }

  const messages = Object.entries(data).map(([field, value]) => {
    const label = fieldLabels[field] ?? field;
    const text = Array.isArray(value)
      ? value.join(" ")
      : typeof value === "string"
        ? value
        : JSON.stringify(value);
    return `${label}: ${text}`;
  });

  return messages.join(" ");
}

export function getTokens(): Tokens | null {
  const access = localStorage.getItem(ACCESS_KEY);
  const refresh = localStorage.getItem(REFRESH_KEY);
  return access && refresh ? { access, refresh } : null;
}

export function setTokens(tokens: Tokens) {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const tokens = getTokens();
  const headers = new Headers(options.headers);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const method = options.method?.toUpperCase() ?? "GET";
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (tokens?.access) {
    headers.set("Authorization", `Bearer ${tokens.access}`);
  }

  try {
    let response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal
    });
    if (response.status === 401 && tokens?.access && (method === "GET" || method === "HEAD")) {
      clearTokens();
      headers.delete("Authorization");
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        signal: options.signal ?? controller.signal
      });
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(formatApiError(payload));
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("A API demorou demasiado a responder. Confirme se o backend esta ligado.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const value = search.toString();
  return value ? `?${value}` : "";
}

export function normalizePage<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : data.results;
}
