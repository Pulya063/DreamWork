import { getAccessToken } from "@/lib/auth";
import type {
  AuthTokens,
  PlanGeneratePayload,
  PlanResponse,
  RegisterPayload,
  SimulationRequestPayload,
  SimulationResponse,
  SkillItem,
  TaskItem,
  UserProfile,
  UserUpdatePayload,
  VerifyTaskResult,
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
  });

  return readResponse<T>(response);
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

export async function fetchCurrentUser() {
  return apiRequest<UserProfile>("/api/users/me", { method: "GET" }, true);
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

export async function fetchSkills() {
  return apiRequest<SkillItem[]>("/api/skills/", { method: "GET" }, true);
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

export async function fetchSimulations() {
  return apiRequest<SimulationResponse[]>("/api/simulation/simulations", { method: "GET" }, true);
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

export async function fetchTasks() {
  return apiRequest<TaskItem[]>("/api/tasks/", { method: "GET" }, true);
}

export async function verifyTaskSubmission(taskId: number, userRequest: string) {
  return apiRequest<VerifyTaskResult>(
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

export { ApiError };
