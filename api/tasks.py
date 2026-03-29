"""
api/tasks.py
Endpoints: GET /tasks, PUT /tasks/{id}/verify, DELETE /tasks/{id}
"""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from api.ai import verify_task
from api.auth import CurrentUser
from database.db import SessionDep
from database.models import Task
from database.schemas import TaskResponse, TaskVerificationRequest, TaskVerificationResponse, VerifyTaskRequest
from services.user_snapshot import get_dashboard_response, to_task_response

router = APIRouter()


@router.get("/", response_model=list[TaskResponse])
async def get_tasks(current_user: CurrentUser, db: SessionDep):
    result = await db.execute(
        select(Task)
        .where(Task.user_id == current_user.id)
        .order_by(Task.created_at.desc())
    )
    tasks = result.scalars().all()
    return [to_task_response(task) for task in tasks]


@router.put("/{id}/verify", response_model=TaskVerificationResponse)
async def verify_task_endpoint(
    id: int,
    body: TaskVerificationRequest,
    current_user: CurrentUser,
    db: SessionDep,
):
    db_result = await db.execute(
        select(Task).where(
            Task.id == id,
            Task.user_id == current_user.id,
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

    task.completed_at = datetime.now(timezone.utc) if verification.completed else None

    db.add(task)
    await db.commit()
    await db.refresh(task)

    return TaskVerificationResponse(
        verification=verification,
        updated_task=to_task_response(task),
        dashboard=await get_dashboard_response(current_user.id, db),
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
