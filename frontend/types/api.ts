export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserProfile {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  is_admin: boolean;
  marital_status?: string | null;
  gender?: string | null;
  age?: number | null;
}

export interface UserUpdatePayload {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  marital_status?: string | null;
  gender?: string | null;
  age?: number | null;
}

export interface TimeEstimate {
  total_hours_needed: number;
  total_weeks_needed: number;
  hours_per_week: number;
}

export interface MarketAnalysis {
  new_vacancies: number;
  closed_vacancies: number;
  change_percent: number;
  market_trend: string;
  description: string;
}

export interface SimulationResponse {
  recommended_skills: string[];
  time_estimate: TimeEstimate;
  market_analysis: MarketAnalysis;
  salary_growth: number;
}

export interface SimulationRequestPayload {
  age?: number | null;
  gender?: string | null;
  marital_status?: string | null;
  target_job: string;
  skills: string[];
  hours_per_week: number;
  current_income: number;
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  user_id: number;
  priority: string;
  deadline?: string | null;
  phase_id?: number | null;
  created_at: string;
  completed_at?: string | null;
}

export interface Phase {
  id: number;
  name: string;
  duration_weeks: number;
  hours: number;
  topics: string[];
  resources: string[];
  plan_id: number;
  tasks: TaskItem[];
}

export interface PlanResponse {
  id: number;
  title: string;
  target_job: string;
  phases: Phase[];
  total_weeks: number;
  total_hours: number;
}

export interface PlanGeneratePayload {
  target_job: string;
  hours_per_week: number;
}

export interface VerifyTaskResult {
  completed: boolean;
  confidence: number;
  feedback: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface SkillItem {
  name: string;
  level?: string | null;
}

export interface SetupContext {
  targetJob: string;
  hoursPerWeek: number;
  currentIncome: number;
  currentSkills: string[];
}
