from typing import List
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from starlette import status

from database.db import SessionDep
from database.models import Skill as SkillModel
from database.schemas import Skill as SkillSchema
from api.auth import CurrentUser

router = APIRouter()

@router.get("/", response_model=List[SkillSchema])
async def get_all_users_skills(db: SessionDep, current_user: CurrentUser):
    result = await db.execute(select(SkillModel).where(SkillModel.user_id == current_user.id))
    all_skills = result.scalars().all()

    if len(all_skills) == 0:
        return []

    return all_skills
#
# @router.post("/gap")
# async def needed_skills():
#