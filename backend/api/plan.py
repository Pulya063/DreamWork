"""
api/plan.py
Endpoints: POST /plan/generate, GET /plan/current, GET /plan/{id}
"""

import json
from datetime import datetime

from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.api.auth import CurrentUser
from backend.database.db import SessionDep
from backend.database.models import Plan, Phase, Simulation, Task
from backend.database.schemas import PlanGenerateRequest, PlanResponse
from backend.example_ai_responses import generate_plan as example_generate_plan
from backend.services.user_snapshot import get_current_plan

router = APIRouter()


def parse_deadline(raw_deadline: object) -> datetime | None:
    if not raw_deadline:
        return None

    try:
        return datetime.fromisoformat(str(raw_deadline))
    except (TypeError, ValueError):
        return None


@router.post("/generate", response_model=PlanResponse)
async def generate_plan(body: PlanGenerateRequest, current_user: CurrentUser, db: SessionDep):
    simulation_result = await db.execute(
        select(Simulation).where(
            Simulation.id == body.simulation_id,
            Simulation.user_id == current_user.id,
        )
    )
    simulation = simulation_result.scalar_one_or_none()

    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found.")

    existing_plan_result = await db.execute(
        select(Plan)
        .options(selectinload(Plan.phases).selectinload(Phase.tasks))
        .where(
            Plan.user_id == current_user.id,
            Plan.simulation_id == simulation.id,
        )
        .order_by(Plan.created_at.desc())
    )
    existing_plan = existing_plan_result.scalars().first()
    if existing_plan:
        return existing_plan

    hours_per_week = int(simulation.input_data.get("hours_per_week") or 1)
    current_skills = ", ".join(simulation.input_data.get("current_skills", [])) or "not provided"
    recommended_skills = ", ".join(simulation.recommended_skills or []) or "not provided"

    prompt = (f"""
        You are an expert career mentor and curriculum designer.
        
        Create a highly detailed and structured learning roadmap for the role: "{simulation.target_job}".
        
        User context:
        - Available time: {hours_per_week} hours per week
        - Current skills: {current_skills}
        - Recommended skills to focus on: {recommended_skills}
        
        Requirements:
        1. The roadmap must be realistic and based on the user's available weekly hours.
        2. Calculate and include:
           - total_hours
           - total_weeks
        3. Divide the roadmap into multiple phases.
        
        Each phase MUST include:
        - phase (number, sequential starting from 1)
        - name (clear and descriptive)
        - duration_weeks
        - hours (approximate total hours for this phase)
        - topics (list of key topics)
        - tasks (list of detailed tasks)
        - resources (learning materials)
        
        Each task MUST include:
        - name
        - description (clear, practical, and actionable)
        - priority (low | medium | high)
        - deadline (ISO format date string, realistic based on phase duration)
        
        Additional rules:
        - Tasks must be practical (projects, exercises, real-world scenarios).
        - Avoid vague tasks like "learn basics" — be specific.
        - Gradually increase difficulty across phases.
        - Include at least one project per phase.
        - Do NOT repeat skills already listed in current_skills unless necessary.
        - Focus more on recommended_skills.
        - Deadlines must align with the phase duration and be logically distributed.
        - Resources should be real and relevant (courses, docs, YouTube, etc.).
        
        Output format:
        Return ONLY valid JSON. No explanations, no markdown, no extra text.
        
        JSON structure:
        
        {{
          "title": "Roadmap for ...",
          "total_hours": number,
          "total_weeks": number,
          "phases": [
            {{
              "phase": number,
              "name": "...",
              "duration_weeks": number,
              "hours": number,
              "topics": ["...", "..."] (from all tasks),
              "tasks": [
                {{
                  "name": "...",
                  "description": "...",
                  "priority": "low | medium | high",
                  "deadline": "YYYY-MM-DDTHH:MM:SS"
                  "topic": "..."
                }}
              ],
              "resources": ["...", "..."]
            }}
          ]
        }}
        """
    )

    from backend.example_ai_responses import generate_plan as example_generate_plan
    ai_response = example_generate_plan

    plan = Plan(
        title=ai_response["title"],
        target_job=simulation.target_job,
        total_weeks=ai_response["total_weeks"],
        total_hours=ai_response["total_hours"],
        user_id=current_user.id,
        simulation_id=simulation.id,
    )
    db.add(plan)
    await db.flush()

    for phase_data in ai_response["phases"]:
        phase = Phase(
            name=phase_data["name"],
            duration_weeks=phase_data["duration_weeks"],
            hours=phase_data["hours"],
            topics=phase_data["topics"],
            resources=phase_data["resources"],
            plan_id=plan.id,
        )
        db.add(phase)
        await db.flush()

        for task_data in phase_data["tasks"]:
            task = Task(
                title=task_data["name"],
                description=task_data["description"],
                priority=task_data["priority"],
                deadline=parse_deadline(task_data.get("deadline")),
                phase_id=phase.id,
                user_id=current_user.id,
                topic=task_data["topic"],
            )
            db.add(task)

    await db.commit()

    result = await db.execute(
        select(Plan)
        .options(selectinload(Plan.phases).selectinload(Phase.tasks))
        .where(Plan.id == plan.id)
    )
    return result.scalar_one()


@router.get("/current", response_model=PlanResponse)
async def get_current_user_plan(current_user: CurrentUser, db: SessionDep):
    plan = await get_current_plan(current_user.id, db)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    return plan


@router.get("/{id}", response_model=PlanResponse)
async def get_plan(id: int, current_user: CurrentUser, db: SessionDep):
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
        raise HTTPException(status_code=404, detail="Plan not found.")

    return plan
