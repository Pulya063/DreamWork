from fastapi import APIRouter
from redis import Redis
from

router = APIRouter()
@router.get("/api/notifications/", tags=["notifications"])
async def get_notifications():
