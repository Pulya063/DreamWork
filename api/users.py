"""
api/users.py
Endpoints: GET /users/me, PUT /users/me
"""

from fastapi import APIRouter
from starlette import status

from api.auth import CurrentUser
from database.db import SessionDep
from database.schemas import ProfileSummaryResponse, UserResponse, UserUpdate
from services.user_snapshot import get_profile_summary

router = APIRouter()


@router.get("/me", response_model=ProfileSummaryResponse)
async def get_user(current_user: CurrentUser, db: SessionDep):
    return await get_profile_summary(current_user, db)


@router.put("/me", response_model=UserResponse)
async def update_user(body: UserUpdate, current_user: CurrentUser, db: SessionDep):
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(current_user: CurrentUser, db: SessionDep):
    await db.delete(current_user)
    await db.commit()
    return {"message": "User deleted successfully"}
