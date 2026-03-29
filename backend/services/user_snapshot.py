from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.database.models import Plan, Phase, Simulation, Skill as SkillModel, Task, User
from backend.database.schemas import (
    DashboardResponse,
    DashboardStats,
    PlanSummaryResponse,
    ProfileSummaryResponse,
    Skill,
    TaskResponse,
    UserResponse,
)


def to_task_response(task: Task) -> TaskResponse:
    description = task.description or f"Complete the task '{task.title}' and submit the result for review."
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=description,
        user_id=task.user_id,
        priority=task.priority,
        deadline=task.deadline,
        phase_id=task.phase_id,
        created_at=task.created_at,
        completed_at=task.completed_at,
    )


def is_due_soon(task: Task) -> bool:
    if not task.deadline or task.completed_at:
        return False

    now = datetime.now(task.deadline.tzinfo) if task.deadline.tzinfo else datetime.now()
    return now <= task.deadline <= now + timedelta(hours=24)


async def get_current_plan(user_id: int, db: AsyncSession) -> Plan | None:
    result = await db.execute(
        select(Plan)
        .options(selectinload(Plan.phases).selectinload(Phase.tasks))
        .where(Plan.user_id == user_id)
        .order_by(Plan.created_at.desc())
    )
    return result.scalars().first()


async def get_latest_simulation(user_id: int, db: AsyncSession) -> Simulation | None:
    result = await db.execute(
        select(Simulation)
        .where(Simulation.user_id == user_id)
        .order_by(Simulation.created_at.desc())
    )
    return result.scalars().first()


async def get_user_tasks(user_id: int, db: AsyncSession, current_plan: Plan | None = None) -> list[Task]:
    if current_plan:
        phase_tasks = [task for phase in current_plan.phases for task in phase.tasks]
        if phase_tasks:
            return sorted(phase_tasks, key=lambda task: task.created_at, reverse=True)

    result = await db.execute(
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    )
    return list(result.scalars().all())


def to_plan_summary(plan: Plan) -> PlanSummaryResponse:
    return PlanSummaryResponse(
        id=plan.id,
        title=plan.title,
        target_job=plan.target_job,
        total_weeks=plan.total_weeks,
        total_hours=plan.total_hours,
    )


def build_dashboard_response(
    current_plan: Plan | None,
    latest_simulation: Simulation | None,
    task_models: list[Task],
) -> DashboardResponse:
    tasks = [to_task_response(task) for task in task_models]
    due_soon_tasks = [task for task in task_models if is_due_soon(task)]
    active_task_model = next((task for task in due_soon_tasks), None) or next(
        (task for task in task_models if not task.completed_at),
        None,
    )

    completed_tasks = sum(1 for task in task_models if task.completed_at)
    total_tasks = len(task_models)
    progress = round((completed_tasks / total_tasks) * 100) if total_tasks else 0

    return DashboardResponse(
        current_plan=current_plan,
        latest_simulation=latest_simulation,
        tasks=tasks,
        active_task=to_task_response(active_task_model) if active_task_model else None,
        stats=DashboardStats(
            progress=progress,
            due_soon_count=len(due_soon_tasks),
            completed_tasks=completed_tasks,
            total_tasks=total_tasks,
        ),
    )


async def get_dashboard_response(user_id: int, db: AsyncSession) -> DashboardResponse:
    current_plan = await get_current_plan(user_id, db)
    latest_simulation = await get_latest_simulation(user_id, db)
    task_models = await get_user_tasks(user_id, db, current_plan)
    return build_dashboard_response(current_plan, latest_simulation, task_models)


async def get_profile_summary(current_user: User, db: AsyncSession) -> ProfileSummaryResponse:
    current_plan = await get_current_plan(current_user.id, db)
    latest_simulation = await get_latest_simulation(current_user.id, db)

    skills_result = await db.execute(
        select(SkillModel)
        .where(SkillModel.user_id == current_user.id)
        .order_by(SkillModel.id.asc())
    )
    skill_models = list(skills_result.scalars().all())

    if skill_models:
        skills = [Skill.model_validate(skill_model) for skill_model in skill_models]
    else:
        fallback_skills = []
        if latest_simulation:
            fallback_skills = latest_simulation.input_data.get("current_skills", [])

        skills = [Skill(name=skill_name, level=None) for skill_name in list(dict.fromkeys(fallback_skills))]

    target_role = None
    if current_plan:
        target_role = current_plan.target_job
    elif latest_simulation:
        target_role = latest_simulation.target_job

    return ProfileSummaryResponse(
        user=UserResponse.model_validate(current_user),
        skills=skills,
        target_role=target_role,
        latest_simulation=latest_simulation,
        latest_plan_summary=to_plan_summary(current_plan) if current_plan else None,
    )
