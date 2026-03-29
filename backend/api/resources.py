"""
api/resources.py
Ендпоінт: POST /resources/search — пошук навчальних матеріалів через LLM.
"""

import os
from fastapi import APIRouter
from openai import AsyncOpenAI
from dotenv import load_dotenv

from backend.api.auth import CurrentUser

load_dotenv()

router = APIRouter()

API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("API_KEY")
client = AsyncOpenAI(api_key=API_KEY)


@router.post("/search")
async def search_resources(target_job, current_user: CurrentUser):
    """
    Пошук навчальних матеріалів: курси, YouTube, форуми, документація.
    LLM підбирає найкращі ресурси під запит.
    """
    job_context = f" для професії '{target_job}'" if target_job else ""

    searched_resources = None

    if job_context != "":
        searched_resources = None # parse resources on youtube and stackoverflow

    return {
        "target_job": target_job,
        "resources": searched_resources,
    }
