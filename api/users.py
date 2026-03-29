"""
api/users.py
Ендпоінти: GET /users/me, PUT /users/me
"""

from fastapi import APIRouter

from database.db import SessionDep
from database.models import TokenBlackList
from database.schemas import UserResponse, UserUpdate
from api.auth import CurrentUser

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_user(current_user: CurrentUser):
    """Отримати профіль поточного користувача."""

    return current_user


@router.put("/me", response_model=UserResponse)
async def update_user(body: UserUpdate, current_user: CurrentUser, db: SessionDep):
    """Оновити профіль поточного користувача."""
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return current_user


async def delete_user(current_user: CurrentUser, db: SessionDep):
    """Видалити поточного користувача."""
    token = TokenBlackList(
        token = current_user
    )

    await db.delete(current_user)
    await db.commit()
    return {"message": "User deleted successfully"}
