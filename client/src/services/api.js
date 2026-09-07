const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "lumea_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Friendly fallback messages by HTTP status, used only when the API
 * response doesn't include its own `message`.
 */
const STATUS_MESSAGES = {
  400: "That request wasn't valid. Please check the details and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "That conflicts with existing data. Please try again.",
  500: "Something went wrong on our end. Please try again.",
};

/**
 * Thin fetch wrapper shared by every service. Automatically attaches the
 * JWT (if present and `auth` isn't disabled) and throws a normalized Error
 * whose `.message` is safe to show the user and whose `.status` is the
 * HTTP status code, so callers can just do try/catch.
 */
export async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const error = new Error(
      "Unable to connect to the server. Please check your connection and try again."
    );
    error.status = 0;
    error.isNetworkError = true;
    throw error;
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response body; leave data as null
  }

  if (!res.ok) {
    const message =
      (data && data.message) || STATUS_MESSAGES[res.status] || "Something went wrong.";
    const error = new Error(message);
    error.status = res.status;

    // A 401 almost always means the stored token is missing/expired/invalid.
    // Clearing it here means the next auth check (or page load) reliably
    // treats the user as logged out instead of retrying with a dead token.
    if (res.status === 401) {
      clearToken();
    }

    throw error;
  }

  return data;
}

/** Builds a query string from an object, skipping empty/undefined/null values. */
export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
