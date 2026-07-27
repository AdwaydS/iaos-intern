/** Tiny typed fetch wrapper. Injects the JWT and unwraps JSON/errors. */
const TOKEN_KEY = "iaos_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(path, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) clearToken();
    throw new ApiError(res.status, body.detail || `Request failed (${res.status})`);
  }
  return body as T;
}

export const get = <T>(p: string) => api<T>(p);
export const post = <T>(p: string, data?: unknown) =>
  api<T>(p, { method: "POST", body: JSON.stringify(data ?? {}) });
export const patch = <T>(p: string, data?: unknown) =>
  api<T>(p, { method: "PATCH", body: JSON.stringify(data ?? {}) });
export const put = <T>(p: string, data?: unknown) =>
  api<T>(p, { method: "PUT", body: JSON.stringify(data ?? {}) });
export const del = (p: string) => api<void>(p, { method: "DELETE" });

