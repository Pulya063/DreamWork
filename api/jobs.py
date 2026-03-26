"""
api/jobs.py
Ендпоінти: POST /jobs/analyze, GET /jobs/market
"""

import os
from fastapi import APIRouter, HTTPException
from openai import AsyncOpenAI
from dotenv import load_dotenv

from api.ai import get_ai_response
from database.db import SessionDep
from api.auth import CurrentUser
from services.web_parcing import parse_job_listings

load_dotenv()

router = APIRouter()

@router.post("/analyze")
async def analyze_job(target_job: str, current_user: CurrentUser):
    """
    Аналіз вакансії: парсить work.ua та отримує від LLM
    аналіз вимог, зарплат, конкуренції.
    """
    # Парсимо вакансії

    job_listings = await parse_job_listings(target_job)

    # LLM аналіз
    jobs_text = ""
    for j in job_listings[:10]:
        jobs_text += f"- {j['title']} | {j['company']} | {j['salary']}\n"

    prompt = (
        f"Ти професійний аналітик ринку, працюєш в компанії роботодавців, твоя задача:"
        f"Проаналізуй ринок вакансій для позиції '{target_job}'.\n"
        f"1. Топ необхідних навичок\n"
        f"2. Потрібні скіли\n"
        f"3. Середній вік працівників\n"
        f"Дай аналіз українською:\n"
        f"Відповідай JSON."
    )

    ai_response = get_ai_response(prompt)

    if not ai_response:
        raise HTTPException(
            status_code=400,
            detail="AI haven`t response",
        )

    return {
        "target_job": target_job,
        "vacancies_found": len(job_listings),
        "sample_listings": job_listings[:5],
        "analysis": ai_response,
    }


# @router.get("/market")
# async def get_market():
#     """
#     Список популярних професій з коротким описом.
#     Статичні дані + LLM-доповнення.
#     """
#
#
#     return {"market_data": }
