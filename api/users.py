"""
api/users.py
Ендпоінти: GET /users/me/{id}, PUT /users/me/{id}
"""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from database.db import SessionDep
from database.models import User
from database.schemas import UserResponse, UserUpdate
from api.auth import CurrentUser

router = APIRouter()


@router.get("/me/{id}", response_model=UserResponse)
async def get_user(id: int, current_user: CurrentUser, db: SessionDep):
    """Отримати профіль користувача. Тільки свій або адмін."""
    if current_user.id != id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ заборонений.",
        )

    return current_user


@router.put("/me/{id}", response_model=UserResponse)
async def update_user(id: int, body: UserUpdate, current_user: CurrentUser, db: SessionDep):
    """Оновити профіль користувача."""
    if current_user.id != id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ заборонений.",
        )

    result = await db.execute(select(User).where(User.id == id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено.")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user
