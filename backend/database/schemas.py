from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Any, Optional, List, Annotated
from datetime import datetime
from fastapi import Form

class Base(BaseModel):

    class Config:
        from_attributes = True

class Register(Base):
    first_name: str = Field(min_length=2, max_length=30)
    last_name: str = Field(min_length=2, max_length=30)
    username: str = Field(min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info):
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('паролі не збігаються')
        return v

UserRegister = Annotated[Register, Form()]

class UserResponse(Base):
    first_name: str
    last_name: str
    username: str = Field(min_length=3, max_length=20)
    email: EmailStr
    is_admin: bool
    marital_status: Optional[str]
    gender: Optional[str]
    age: Optional[int]

class Skill(Base):
    name: str

class SimulationRequest(Base):
    age: Optional[int] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    target_job: str = Field(min_length=2, max_length=50)
    skills: List[str]
    hours_per_week: int = Field(gt=0)
    current_income: int = Field(gt=0)

    @field_validator('hours_per_week')
    def hours_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Hours per week must be a positive integer')
        return v


class TimeEstimate(Base):
    total_hours_needed: int
    total_weeks_needed: int
    hours_per_week: int

class MarketAnalysis(Base):
    new_vacancies: int
    closed_vacancies: int
    change_percent: float
    market_trend: str
    description: str

class SimulationResponse(Base):
    id: int
    target_job: str
    input_data: dict[str, Any]
    recommended_skills: List[str]
    time_estimate: TimeEstimate
    market_analysis: MarketAnalysis
    salary_growth: float
    created_at: datetime


class UserUpdate(Base):
    first_name: Optional[str] = Field(default=None, min_length=2, max_length=30)
    last_name: Optional[str] = Field(default=None, min_length=2, max_length=30)
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    marital_status: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None

class AdviceRequest(Base):
    target_job: str = Field(min_length=2, examples=["Senior Frontend Developer"])
    question: str = Field(
        default="Що мені вивчити далі?",
        examples=["Які навички найважливіші для цієї позиції?"],
    )

class PlanGenerateRequest(Base):
    simulation_id: int = Field(gt=0)


class PlanResponse(Base):
    id: int
    title: str = Field(min_length=3, max_length=50)
    target_job: str = Field(min_length=2)
    phases: List['Phase'] = []
    total_weeks: int
    total_hours: int

    @field_validator('total_hours', 'total_weeks')
    def hours_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Hours per week must be a positive integer')
        return v

class Task(Base):
    title: str = Field(min_length=3, max_length=50)
    description: str = Field(min_length=30, max_length=500)

class TaskCreate(Task):
    priority: str = Field(default="medium")
    deadline: Optional[datetime] = None
    phase_id: Optional[int] = None

class TaskResponse(Task):
    id: int
    user_id: int
    priority: str
    deadline: Optional[datetime] = None
    phase_id: Optional[int] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

class Hometask(Base):
    completed: bool
    confidence: int
    feedback: str


class PhaseBase(Base):
    name: str = Field(min_length=2)
    duration_weeks: int = Field(gt=0)
    hours: int = Field(gt=0)
    topics: List[str] = []
    resources: List[str] = []

class Phase(PhaseBase):
    id: int
    plan_id: int
    tasks: List[TaskResponse] = []

class AdviceRequest(BaseModel):
    target_job: str = Field(..., min_length=2, examples=["Senior Frontend Developer"])
    question: str = Field(
        default="Що мені вивчити далі?"
    )

class PredictRequest(BaseModel):
    hours_per_week: float = Field(gt=0, examples=[15])
    target_income: float = Field(gt=0, examples=[95000])
    n_current_skills: int = Field(ge=0, examples=[5])
    n_missing_skills: int = Field(ge=0, examples=[3])


PlanResponse.model_rebuild()


class VerifyTaskRequest(Base):
    task_description: str
    user_request: str


class TaskVerificationRequest(Base):
    user_request: str = Field(min_length=1)

class DashboardStats(Base):
    progress: int
    due_soon_count: int
    completed_tasks: int
    total_tasks: int

class DashboardResponse(Base):
    current_plan: Optional[PlanResponse] = None
    latest_simulation: Optional[SimulationResponse] = None
    tasks: List[TaskResponse] = []
    active_task: Optional[TaskResponse] = None
    stats: DashboardStats


class ProfileSummaryResponse(Base):
    user: UserResponse
    skills: List[Skill] = []
    target_role: Optional[str] = None
    latest_simulation: Optional[SimulationResponse] = None
    latest_plan_summary: Optional[PlanResponse] = None


class TaskVerificationResponse(Base):
    verification: Hometask
    updated_task: TaskResponse

class TaskStats(Base):
    progress: int
    due_soon_count: int
    completed_tasks: int
    total_tasks: int

class TaskListResponse(Base):
    tasks: List[TaskResponse]
    active_task: Optional[TaskResponse] = None
    stats: TaskStats
