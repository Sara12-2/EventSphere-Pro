const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5057/api";

let accessToken = null;
let authChangeListeners = [];
let refreshInFlight = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function onAuthChange(listener) {
  authChangeListeners.push(listener);
  return () => {
    authChangeListeners = authChangeListeners.filter((l) => l !== listener);
  };
}

function notifyAuthChange(payload) {
  authChangeListeners.forEach((listener) => listener(payload));
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || "Request failed");
    this.status = status;
    this.error = body?.error;
    this.fields = body?.fields;
  }
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function rawRequest(path, { method = "GET", body, skipAuth = false } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken && !skipAuth) headers["Authorization"] = `Bearer ${accessToken}`;

  // /auth/refresh and /auth/logout authenticate via the httpOnly refresh
  // cookie rather than the Authorization header, so they need the
  // double-submit CSRF token the backend exposes in a readable cookie.
  if (path === "/auth/refresh" || path === "/auth/logout") {
    const csrfToken = readCookie("csrf_refresh_token");
    if (csrfToken) headers["X-CSRF-TOKEN"] = csrfToken;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

async function trySilentRefresh() {
  if (!refreshInFlight) {
    refreshInFlight = rawRequest("/auth/refresh", { method: "POST", skipAuth: true })
      .then((data) => {
        accessToken = data.access_token;
        notifyAuthChange({ accessToken: data.access_token, user: data.user });
        return data.access_token;
      })
      .catch((err) => {
        accessToken = null;
        notifyAuthChange(null);
        throw err;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function apiRequest(path, options = {}) {
  try {
    return await rawRequest(path, options);
  } catch (err) {
    const isAuthRoute = path.startsWith("/auth/");
    if (err instanceof ApiError && err.status === 401 && !isAuthRoute) {
      await trySilentRefresh();
      return rawRequest(path, options);
    }
    throw err;
  }
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: "POST", body: body ?? {} }),
  patch: (path, body) => apiRequest(path, { method: "PATCH", body: body ?? {} }),
  delete: (path) => apiRequest(path, { method: "DELETE" }),
  refresh: () => trySilentRefresh(),
};
