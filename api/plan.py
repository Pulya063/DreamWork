"""
api/plan.py
Ендпоінти: POST /plan/generate, GET /plan/{id}
"""

import os
from unittest.mock import patch
from datetime import datetime

from fastapi import APIRouter, HTTPException
from openai import AsyncOpenAI
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from dotenv import load_dotenv
import json

import api.ai
from api.ai import get_ai_response
from database.db import SessionDep
from database.models import Plan, Simulation, Phase, Task
from database.schemas import PlanGenerateRequest, PlanResponse
from api.auth import CurrentUser
from example_ai_responses import generate_plan

load_dotenv()

router = APIRouter()

API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("API_KEY")
client = AsyncOpenAI(api_key=API_KEY)

example = generate_plan

@patch("api.ai.get_ai_response", return_value=example)
@router.post("/generate", response_model=PlanResponse)
async def generate_plan(body: PlanGenerateRequest, current_user: CurrentUser, db: SessionDep):
    """
    Створення навчального roadmap за допомогою LLM.
    Генерує фази, завдання, оцінку годин.
    """
    prompt = (
        f"Створи детальний навчальний план (roadmap) для професії '{body.target_job}'. "
        f"Користувач може приділяти {body.hours_per_week} годин на тиждень.\n\n"
        f"Формат відповіді — JSON:\n"
        f'{{\n'
        f'  "title": "Назва плану",\n'
        f'  "total_hours": число,\n'
        f'  "total_weeks": число,\n'
        f'  "phases": [\n'
        f'    {{\n'
        f'      "phase": 1 (id),\n'
        f'      "name": "Назва фази",\n'
        f'      "duration_weeks": число,\n'
        f'      "hours": число,\n'
        f'      "topics": ["тема1", "тема2"],\n'
        f'      "tasks": [\n'
        f'        {{\n'
        f'          "name": "Назва завдання",\n'
        f'          "description": "Детальний опис того, що потрібно зробити, розписаний на декілька речень.",\n'
        f'          "priority": "medium",\n'
        f'          "deadline": null\n'
        f'        }}\n'
        f'      ],\n'
        f'      "resources": ["ресурс1", "ресурс2"]\n'
        f'    }}\n'
        f'  ]\n'
        f'}}\n'
        f"Відповідай ТІЛЬКИ JSON, без markdown. Опиши кожне завдання у полі 'description' по декілька речень."
    )

    from example_ai_responses import generate_plan
    ai_response = generate_plan   # get_ai_response(prompt)

    json_string_data = json.dumps(ai_response)

    data = json.loads(json_string_data)


    title = data["title"]
    total_weeks = data["total_weeks"]
    total_hours = data["total_hours"]

    sim_db = await db.execute(select(Simulation.id).where(Simulation.user_id == current_user.id, Simulation.target_job == body.target_job))
    simulation_id = sim_db.scalar_one_or_none()

    plan = Plan(
        title=title,
        target_job=body.target_job,
        total_weeks=total_weeks,
        total_hours=total_hours,
        user_id=current_user.id,
        simulation_id=simulation_id,
    )

    db.add(plan)
    await db.commit()
    await db.refresh(plan)

    phases_data = ai_response["phases"]
    for p_data in phases_data:
        phase = Phase(
            name=p_data["name"],
            duration_weeks=p_data["duration_weeks"],
            hours=p_data["hours"],
            topics=p_data["topics"],
            resources=p_data["resources"],
            plan_id=plan.id
        )
        db.add(phase)
        await db.commit()
        await db.refresh(phase)

        tasks_data = p_data["tasks"]
        for t_data in tasks_data:
            raw_deadline = t_data["deadline"]
            deadline_val = None
            if raw_deadline and raw_deadline != "":
                try:
                    deadline_val = datetime.fromisoformat(str(raw_deadline))
                except (ValueError, TypeError):
                    deadline_val = None

            task = Task(
                title=t_data["name"],
                description=t_data["description"],
                priority=t_data["priority"],
                deadline=deadline_val,
                phase_id=phase.id,
                user_id=current_user.id
            )
            db.add(task)
            
    await db.commit()

    result = await db.execute(
        select(Plan)
        .options(selectinload(Plan.phases).selectinload(Phase.tasks))
        .where(Plan.id == plan.id)
    )
    plan_with_rels = result.scalar_one()

    return plan_with_rels


@router.get("/{id}", response_model=PlanResponse)
async def get_plan(id: int, current_user: CurrentUser, db: SessionDep):
    """Отримати збережений план за ID."""
    result = await db.execute(
        select(Plan)
        .options(selectinload(Plan.phases).selectinload(Phase.tasks))
        .where(
            Plan.id == id,
            Plan.user_id == current_user.id,
        )
    )
    plan = result.scalar_one_or_none()

    if not plan:
        raise HTTPException(status_code=404, detail="План не знайдено.")

    return plan
