import { getAccessToken, getAuthSession, setAuthSession } from "@/lib/auth";
import type {
  AdvicePayload,
  AdviceResponse,
  AuthTokens,
  DashboardResponse,
  PlanGeneratePayload,
  PlanResponse,
  ProfileSummaryResponse,
  RegisterPayload,
  ResourceSearchResponse,
  SimulationRequestPayload,
  SimulationResponse,
  TaskListResponse,
  UserProfile,
  UserUpdatePayload,
  VerifyTaskResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = "Request failed";

    try {
      const errorData = (await response.json()) as { detail?: string };
      detail = errorData.detail ?? detail;
    } catch {
      detail = response.statusText || detail;
    }

    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function apiRequest<T>(path: string, init: RequestInit = {}, authenticated = false) {
  return apiRequestInternal<T>(path, init, authenticated, true);
}

async function apiRequestInternal<T>(
  path: string,
  init: RequestInit = {},
  authenticated = false,
  allowRefresh = true,
) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (authenticated) {
    const token = getAccessToken();
    if (!token) {
      throw new ApiError("Authentication required", 401);
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    credentials: "include",
  });

  if (authenticated && response.status === 401 && allowRefresh) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return apiRequestInternal<T>(path, init, authenticated, false);
    }
  }

  return readResponse<T>(response);
}

async function refreshAccessToken() {
  try {
    const currentSession = getAuthSession();
    const refreshed = await apiRequestInternal<Partial<AuthTokens>>("/api/auth/refresh", { method: "POST" }, false, false);

    if (refreshed.access_token) {
      setAuthSession({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token ?? currentSession?.refresh_token,
        token_type: refreshed.token_type ?? currentSession?.token_type ?? "bearer",
      });
    }

    return Boolean(refreshed.access_token);
  } catch {
    return false;
  }
}

export async function registerUser(payload: RegisterPayload) {
  const body = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      body.set(key, String(value));
    }
  });

  return apiRequest<UserProfile>(
    "/api/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
    false,
  );
}

export async function loginUser(username: string, password: string) {
  const body = new URLSearchParams({ username, password });

  return apiRequest<AuthTokens>(
    "/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
    false,
  );
}

export async function logoutUser() {
  return apiRequest<void>("/api/auth/logout", { method: "POST" }, true);
}

export async function fetchDashboard() {
  return apiRequest<DashboardResponse>("/api/dashboard/", { method: "GET" }, true);
}

export async function fetchProfileSummary() {
  return apiRequest<ProfileSummaryResponse>("/api/users/me", { method: "GET" }, true);
}

export async function fetchTaskList() {
  return apiRequest<TaskListResponse>("/api/tasks/", { method: "GET" }, true);
}

export async function updateCurrentUser(payload: UserUpdatePayload) {
  return apiRequest<UserProfile>(
    "/api/users/me",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    true,
  );
}

export async function deleteCurrentUser() {
  return apiRequest<void>("/api/users/me", { method: "DELETE" }, true);
}

export async function fetchCurrentPlan() {
  return apiRequest<PlanResponse>("/api/plan/current", { method: "GET" }, true);
}

export async function fetchLatestSimulation() {
  return apiRequest<SimulationResponse>("/api/simulation/latest", { method: "GET" }, true);
}

export async function fetchSimulationHistory() {
  return apiRequest<SimulationResponse[]>("/api/simulation/simulations", { method: "GET" }, true);
}

export async function fetchSimulationById(id: number) {
  return apiRequest<SimulationResponse>(`/api/simulation/simulations/${id}`, { method: "GET" }, true);
}

export async function runSimulation(payload: SimulationRequestPayload) {
  return apiRequest<SimulationResponse>(
    "/api/simulation/simulate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    true,
  );
}

export async function generatePlan(payload: PlanGeneratePayload) {
  return apiRequest<PlanResponse>(
    "/api/plan/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    true,
  );
}

export async function deleteTask(taskId: number) {
  return apiRequest<void>(`/api/tasks/${taskId}`, { method: "DELETE" }, true);
}

export async function verifyTaskSubmission(taskId: number, userRequest: string) {
  return apiRequest<VerifyTaskResponse>(
    `/api/tasks/${taskId}/verify`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_request: userRequest }),
    },
    true,
  );
}

export async function requestAdvice(payload: AdvicePayload) {
  return apiRequest<AdviceResponse>(
    "/api/ai/advice",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    true,
  );
}

export async function searchResources(targetJob: string) {
  return apiRequest<ResourceSearchResponse>(
    `/api/resources/search?target_job=${encodeURIComponent(targetJob)}`,
    {
      method: "POST",
    },
    true,
  );
}

export { ApiError };
