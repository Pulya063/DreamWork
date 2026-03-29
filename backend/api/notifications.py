"""
api/notifications.py
Ендпоінти: GET /notifications, POST /notifications/settings
"""

from fastapi import APIRouter

router = APIRouter()

#
# @router.get("/")
# async def get_notifications(current_user: CurrentUser, db: SessionDep):
#     """
#     Отримати повідомлення про дедлайни.
#     Перевіряє задачі користувача та повертає:
#     - overdue — прострочені
#     - upcoming — дедлайн найближчим часом
#     """
#     result = await db.execute(
#         select(Task).where(
#             Task.user_id == current_user.id,
#             Task.is_completed == False,
#             Task.deadline.isnot(None),
#         )
#     )
#     tasks = result.scalars().all()
#
#     # Дістаємо налаштування користувача
#     settings_result = await db.execute(
#         select(NotificationSetting).where(
#             NotificationSetting.user_id == current_user.id
#         )
#     )
#     settings = settings_result.scalar_one_or_none()
#     reminder_hours = settings.reminder_hours_before if settings else 24
#
#     now = datetime.now(timezone.utc)
#     overdue = []
#     upcoming = []
#
#     for task in tasks:
#         deadline = task.deadline
#         if deadline.tzinfo is None:
#             deadline = deadline.replace(tzinfo=timezone.utc)
#
#         hours_left = (deadline - now).total_seconds() / 3600
#
#         task_info = {
#             "task_id": task.id,
#             "title": task.title,
#             "deadline": task.deadline.isoformat(),
#             "priority": task.priority,
#             "hours_left": round(hours_left, 1),
#         }
#
#         if hours_left < 0:
#             task_info["status"] = "overdue"
#             overdue.append(task_info)
#         elif hours_left <= reminder_hours:
#             task_info["status"] = "upcoming"
#             upcoming.append(task_info)
#
#     return {
#         "overdue": overdue,
#         "upcoming": upcoming,
#         "total_alerts": len(overdue) + len(upcoming),
#     }
#
#
# @router.post("/settings", response_model=NotificationSettingsResponse)
# async def update_notification_settings(
#     body: NotificationSettingsUpdate,
#     current_user: CurrentUser,
#     db: SessionDep,
# ):
#     """Оновити або створити налаштування повідомлень."""
#     result = await db.execute(
#         select(NotificationSetting).where(
#             NotificationSetting.user_id == current_user.id
#         )
#     )
#     settings = result.scalar_one_or_none()
#
#     if not settings:
#         settings = NotificationSetting(user_id=current_user.id)
#         db.add(settings)
#
#     update_data = body.model_dump(exclude_unset=True)
#     for field, value in update_data.items():
#         setattr(settings, field, value)
#
#     db.add(settings)
#     await db.commit()
#     await db.refresh(settings)
#
#     return settings
