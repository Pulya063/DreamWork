import type { AuthTokens, PlanResponse, SetupContext, SimulationResponse } from "@/types/api";

const AUTH_STORAGE_KEY = "dreamwork.auth";
const PLAN_STORAGE_KEY = "dreamwork.plan";
const SIMULATION_STORAGE_KEY = "dreamwork.simulation";
const SETUP_STORAGE_KEY = "dreamwork.setup";

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

export function storeLastPlan(plan: PlanResponse) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
}

export function getStoredPlan(): PlanResponse | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(PLAN_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as PlanResponse;
  } catch {
    window.localStorage.removeItem(PLAN_STORAGE_KEY);
    return null;
  }
}

export function storeLastSimulation(simulation: SimulationResponse) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(simulation));
}

export function getStoredSimulation(): SimulationResponse | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(SIMULATION_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as SimulationResponse;
  } catch {
    window.localStorage.removeItem(SIMULATION_STORAGE_KEY);
    return null;
  }
}

export function storeSetupContext(context: SetupContext) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(context));
}

export function getStoredSetupContext(): SetupContext | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(SETUP_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as SetupContext;
  } catch {
    window.localStorage.removeItem(SETUP_STORAGE_KEY);
    return null;
  }
}
