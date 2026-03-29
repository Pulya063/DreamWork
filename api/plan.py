"""
api/plan.py
Endpoints: POST /plan/generate, GET /plan/current, GET /plan/{id}
"""

import json
from datetime import datetime

from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from api.auth import CurrentUser
from database.db import SessionDep
from database.models import Plan, Phase, Simulation, Task
from database.schemas import PlanGenerateRequest, PlanResponse
from example_ai_responses import generate_plan as example_generate_plan
from services.user_snapshot import get_current_plan

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

    prompt = (
        f"Create a detailed learning roadmap for the role '{simulation.target_job}'. "
        f"The user can dedicate {hours_per_week} hours per week. "
        f"Current skills: {current_skills}. "
        f"Recommended skills to focus on: {recommended_skills}. "
        "Return JSON only with title, total_hours, total_weeks, and phases with tasks."
    )

    _ = prompt
    ai_response = json.loads(json.dumps(example_generate_plan))

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
