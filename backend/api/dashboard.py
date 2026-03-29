from fastapi import APIRouter

from backend.api.auth import CurrentUser
from backend.database.db import SessionDep
from backend.database.schemas import DashboardResponse
from backend.services.user_snapshot import get_dashboard_response

router = APIRouter()


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(current_user: CurrentUser, db: SessionDep):
    return await get_dashboard_response(current_user.id, db)
