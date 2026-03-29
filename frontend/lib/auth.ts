import type { AuthTokens } from "@/types/api";

const AUTH_STORAGE_KEY = "dreamwork.auth";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAuthSession(): AuthTokens | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthTokens;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function setAuthSession(tokens: AuthTokens) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAccessToken() {
  return getAuthSession()?.access_token ?? null;
}
