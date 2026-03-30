"""
api/tasks.py
Endpoints: GET /tasks, PUT /tasks/{id}/verify, DELETE /tasks/{id}
"""

from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.api.ai import verify_task
from backend.api.auth import CurrentUser
from backend.database.db import SessionDep
from backend.database.models import Task, Skill, User, Plan
from backend.database.schemas import TaskListResponse, TaskResponse, TaskStats, TaskVerificationRequest, TaskVerificationResponse, VerifyTaskRequest
router = APIRouter()


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


async def get_user_tasks(user_id: int, db: SessionDep, current_plan: Plan | None = None) -> list[Task]:
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


@router.get("/", response_model=TaskListResponse)
async def get_tasks(current_user: CurrentUser, db: SessionDep):
    task_models = await get_user_tasks(current_user.id, db)
    tasks = [to_task_response(task) for task in task_models]
    due_soon_tasks = [task for task in task_models if is_due_soon(task)]
    active_task_model = next((task for task in due_soon_tasks), None) or next(
        (task for task in task_models if not task.completed_at),
        None,
    )

    completed_tasks = sum(1 for task in task_models if task.completed_at)
    total_tasks = len(task_models)
    progress = round((completed_tasks / total_tasks) * 100) if total_tasks else 0

    return TaskListResponse(
        tasks=tasks,
        active_task=to_task_response(active_task_model) if active_task_model else None,
        stats=TaskStats(
            progress=progress,
            due_soon_count=len(due_soon_tasks),
            completed_tasks=completed_tasks,
            total_tasks=total_tasks,
        ),
    )


@router.put("/{id}/verify", response_model=TaskVerificationResponse)
async def verify_task_endpoint(
    id: int,
    body: TaskVerificationRequest,
    current_user: CurrentUser,
    db: SessionDep,
):
    db_result = await db.execute(
        select(Task).options(selectinload(Task.user).selectinload(User.skills)).where(
            Task.id == id,
            Task.user_id == current_user.id
        )
    )
    task = db_result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    verification = await verify_task(
        VerifyTaskRequest(
            task_description=task.description or task.title,
            user_request=body.user_request,
        )
    )

    if verification.completed:
        if task.title not in [skill.name for skill in task.user.skills]:
            update_skills = Skill(
                name=task.topic,
                user_id=current_user.id,
            )
            db.add(update_skills)
            await db.commit()
            await db.refresh(update_skills)


    task.completed_at = datetime.now(timezone.utc) if verification.completed else None

    db.add(task)
    await db.commit()
    await db.refresh(task)

    return TaskVerificationResponse(
        verification=verification,
        updated_task=to_task_response(task)
    )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(id: int, current_user: CurrentUser, db: SessionDep):
    result = await db.execute(
        select(Task).where(
            Task.id == id,
            Task.user_id == current_user.id,
        )
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    await db.delete(task)
    await db.commit()
    return None
