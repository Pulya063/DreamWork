"""
api/ai.py
AI ендпоінти: персональні поради (LLM), тренування ML-моделі,
прогнозування на основі попередніх симуляцій, верифікація задач.
"""
import json

from fastapi import APIRouter
from sqlalchemy import select
from dotenv import load_dotenv

from backend.database.schemas import AdviceRequest, VerifyTaskRequest, Hometask
from backend.database.db import SessionDep
from backend.database.models import Skill
from backend.api.auth import CurrentUser

load_dotenv()

router = APIRouter()

# API_KEY = os.getenv("API_KEY") if os.getenv("API_KEY") else "asdasdads"
#
# client = AsyncOpenAI(api_key=API_KEY)

# async def get_ai_response(prompt: str) -> str:
#     # response = await client.chat.completions.create(
#     #     model="gpt-4o-mini",
#     #     messages=[{"role": "user", "content": prompt}],
#     #     temperature=0.4,
#     #     response_format={"type": "json_object"}
#     # )
#     #
#     # json_string = response.choices[0].message.content
#
#     json_string = {
#         "dwad": 1,
#         "awd": "awdaw"
#     }
#
#     json_string_data = json.dumps(json_string)
#
#     data = json.loads(json_string_data)
#
#     return data
# ─── LLM helper ────────────────────────────────────────────

def get_ai_response(prompt: str) -> dict:
    if "Створи детальний навчальний план" in prompt:
        from backend.example_ai_responses import generate_plan
        return generate_plan

    if "You are a career advisor and labor market analyst" in prompt:
        from backend.example_ai_responses import simulation
        return simulation

    if "Ти ментор-ревʼювер" in prompt:
        return {"completed": True, "confidence": 95, "feedback": "Все виконано чудово!"}
        
    return {"advice": "Рекомендую зосередитись на практиці та вивченні Python з нуля."}


# ─── Endpoints ──────────────────────────────────────────────

@router.post("/advice")
async def personal_advice(
    body: AdviceRequest,
    current_user: CurrentUser,
    db: SessionDep,
):
    """
    Персональна порада від AI.
    Збирає навички користувача з БД і надсилає контекстний запит до LLM.
    """
    # Дістаємо навички користувача
    result = await db.execute(
        select(Skill).where(Skill.user_id == current_user.id)
    )
    skills = result.scalars().all()
    skill_list = ", ".join(f"{s.name} (рівень {s.level})" for s in skills) or "не вказані"

    prompt = (
        f"Ти досвідчений кар'єрний консультант. Користувач: "
        f"вік {current_user.age}.\n"
        f"Поточні навички: {skill_list}.\n"
        f"Бажана посада: {body.target_job}.\n"
        f"Питання: {body.question}\n\n"
        f"Дай конкретну, структуровану пораду українською мовою."
    )

    advice = get_ai_response(prompt)

    from backend.example_ai_responses import example_advice

    example_ai_advice = example_advice

    return example_ai_advice


async def verify_task(body: VerifyTaskRequest) -> Hometask:
    """
    AI верифікація виконання задачі.
    LLM оцінює чи справді користувач виконав задачу на основі його звіту.
    """

    prompt = (
            f"Ти ментор-ревʼювер. Задача: \"{body.task_description}\".\n"
            f"Звіт користувача: \"{body.user_request}\".\n\n"
            f"Оціни чи задача виконана. Відповідь у форматі:\n"
            f"- completed: true/false\n"
            f"- confidence: 0-100%\n"
            f"- feedback: короткий коментар\n"
            f"Відповідай JSON."
    )

    result = get_ai_response(prompt)

    from backend.example_ai_responses import task_response

    example_ai_response = task_response.copy()
    confidence = str(example_ai_response.get("confidence", "0")).replace("%", "").strip()
    example_ai_response["confidence"] = int(confidence or 0)

    return Hometask(**example_ai_response)

# async def train_model(
#     current_user: CurrentUser,
#     db: SessionDep,
# ):
#     """
#     Тренує ML-модель на ВСІХ попередніх симуляціях з БД.
#
#     Дістає Simulation записи, конвертує у bytes (DataPacker),
#     тренує LinearRegression для income та roi.
#     Повертає розміри даних у байтах.
#     """
#     result = await db.execute(select(Simulation))
#     simulations = result.scalars().all()
#
#     if not simulations:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Немає записів симуляцій для тренування. Спочатку виконайте кілька симуляцій.",
#         )
#
#     # Конвертуємо ORM об'єкти у словники
#     records = []
#     for sim in simulations:
#         records.append({
#             "input_data": sim.input_data or {},
#             "result_data": sim.result_data or {},
#             "expected_income": sim.expected_income or 0.0,
#             "roi": sim.roi or 0.0,
#         })
#
#     train_result = analyzer.train(records)
#     return train_result

# async def predict():
#     """
#     Прогнозує expected_income та roi на основі натренованої ML-моделі.
#     Вхідні дані конвертуються в bytes для ефективності.
#     """
#     prediction = analyzer.predict(
#         hours_per_week=body.hours_per_week,
#         n_current_skills=body.n_current_skills,
#         target_income=body.target_income,
#         n_missing_skills=body.n_missing_skills,
#     )
#
#     if prediction["status"] == "not_trained":
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=prediction["message"],
#         )
#
#     return prediction
#
#
# async def model_info(current_user: CurrentUser):
#     """
#     Інформація про поточний стан ML-моделі: чи натренована,
#     розміри кешованих даних у байтах.
#     """
#     if not analyzer.is_trained:
#         return {
#             "is_trained": False,
#             "message": "Модель не натренована. Виконайте POST /ai/train.",
#         }
#
#     model_blob = analyzer.get_model_bytes()
#     return {
#         "is_trained": True,
#         "total_model_size": analyzer.packer.get_size_info(model_blob) if model_blob else None,
#         "cached_models": {
#             "income_model": analyzer.packer.get_size_info(analyzer._cached_income_bytes) if analyzer._cached_income_bytes else None,
#             "roi_model": analyzer.packer.get_size_info(analyzer._cached_roi_bytes) if analyzer._cached_roi_bytes else None,
#             "scaler": analyzer.packer.get_size_info(analyzer._cached_scaler_bytes) if analyzer._cached_scaler_bytes else None,
#         },
#     }
