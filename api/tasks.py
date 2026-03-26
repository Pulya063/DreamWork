"""
api/tasks.py
Ендпоінти: GET /tasks, POST /tasks, PUT /tasks/{id}, DELETE /tasks/{id}
"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from database.db import SessionDep
from database.models import Task
from database.schemas import TaskCreate, VerifyTaskRequest, TaskResponse
from api.auth import CurrentUser
from api.ai import get_ai_response

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
    # Map model DB fields (title) to the schema fields (name)
    return [
        TaskResponse(
            title=t.title,
            description=t.description,
            completed_at=t.completed_at,
            id=t.id,
            user_id=t.user_id,
            priority=t.priority,
            deadline=t.deadline,
            created_at=t.created_at,
            phase_id = t.phase_id,
        ) for t in tasks
    ]


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(body: TaskCreate, current_user: CurrentUser, db: SessionDep):
    """Створити нову задачу."""
    task = Task(
        title=body.title,
        description=body.description,
        priority=body.priority,
        deadline=body.deadline,
        phase_id=body.phase_id,
        user_id=current_user.id,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.put("/{id}", response_model=TaskResponse)
async def check_task_response(id: int, body: VerifyTaskRequest, current_user: CurrentUser, db: SessionDep):
    

    update_data = body.model_dump(exclude_unset=True)

    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


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
