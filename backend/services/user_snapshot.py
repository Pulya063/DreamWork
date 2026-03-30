from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.plan import fetch_latest_plan, to_plan_summary
from backend.api.simulation import fetch_latest_simulation
from backend.api.tasks import get_user_tasks, to_task_response, is_due_soon
from backend.database.models import Plan, Simulation, Skill as SkillModel, Task, User
from backend.database.schemas import (
    DashboardResponse,
    DashboardStats,
    ProfileSummaryResponse,
    Skill,
    UserResponse,
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
    current_plan = await fetch_latest_plan(user_id, db)
    latest_simulation = await fetch_latest_simulation(user_id, db)
    task_models = await get_user_tasks(user_id, db, current_plan)
    return build_dashboard_response(current_plan, latest_simulation, task_models)


async def get_profile_summary(current_user: User, db: AsyncSession) -> ProfileSummaryResponse:
    current_plan = await fetch_latest_plan(current_user.id, db)
    latest_simulation = await fetch_latest_simulation(current_user.id, db)

    skills_result = await db.execute(
        select(SkillModel)
        .where(SkillModel.user_id == current_user.id)
        .order_by(SkillModel.id.asc())
    )
    skill_models = list(skills_result.scalars().all())

    if skill_models:
        skills = [Skill.model_validate(skill_model) for skill_model in skill_models]
    else:
        skills = []

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
