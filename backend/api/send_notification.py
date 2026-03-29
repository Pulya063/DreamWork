from redis import Redis

from backend.database.models import User

redis_client = Redis(host='localhost', port=6379, db=0)

async def send_notification(user: User, message: str):
    notification = {
        "user_email": user.email,
        "message": message
    }
    await redis_client.publish('notifications', str(notification))


