from fastapi import APIRouter

from api.auth import CurrentUser
from database.db import SessionDep
from database.schemas import DashboardResponse
from services.user_snapshot import get_dashboard_response

router = APIRouter()


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(current_user: CurrentUser, db: SessionDep):
    return await get_dashboard_response(current_user.id, db)
