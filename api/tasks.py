"""
api/tasks.py
Ендпоінти: GET /tasks, PUT /tasks/{id}/verify, DELETE /tasks/{id}
"""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from api.ai import verify_task
from api.auth import CurrentUser
from database.db import SessionDep
from database.models import Task
from database.schemas import Hometask, TaskResponse, TaskVerificationRequest, VerifyTaskRequest

router = APIRouter()


@router.get("/", response_model=list[TaskResponse])
async def get_tasks(current_user: CurrentUser, db: SessionDep):
    """Отримати всі задачі поточного користувача."""
    result = await db.execute(
        select(Task)
        .where(Task.user_id == current_user.id)
        .order_by(Task.created_at.desc())
    )
    tasks = result.scalars().all()

    return [
        TaskResponse(
            title=t.title,
            description=t.description or "",
            completed_at=t.completed_at,
            id=t.id,
            user_id=t.user_id,
            priority=t.priority,
            deadline=t.deadline,
            created_at=t.created_at,
            phase_id=t.phase_id,
        )
        for t in tasks
    ]


@router.put("/{id}/verify", response_model=Hometask)
async def verify_task_endpoint(
    id: int,
    body: TaskVerificationRequest,
    current_user: CurrentUser,
    db: SessionDep,
):
    """Перевірити виконання задачі та оновити її статус."""
    db_result = await db.execute(select(Task).where(Task.id == id, Task.user_id == current_user.id))
    task = db_result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Задачу не знайдено.")

    verification = await verify_task(
        VerifyTaskRequest(
            task_description=task.description or task.title,
            user_request=body.user_request,
        )
    )

    task.completed_at = datetime.now(timezone.utc) if verification.completed else None

    db.add(task)
    await db.commit()

    return verification


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(id: int, current_user: CurrentUser, db: SessionDep):
    """Видалити задачу."""
    result = await db.execute(
        select(Task).where(
            Task.id == id,
            Task.user_id == current_user.id,
        )
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Задачу не знайдено.")

    await db.delete(task)
    await db.commit()
    return None
