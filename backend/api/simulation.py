"""
api/simulation.py
Endpoints: POST /simulate, GET /latest, GET /simulations, GET /simulations/{id}
"""

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from backend.api.auth import CurrentUser
from backend.database.db import SessionDep
from backend.database.models import Simulation
from backend.database.schemas import SimulationRequest, SimulationResponse
from backend.services.simulator import Simulator

router = APIRouter()
simulator = Simulator()


@router.post("/simulate", response_model=SimulationResponse)
async def run_simulation(body: SimulationRequest, current_user: CurrentUser, db: SessionDep):
    input_data = {
        "target_job": body.target_job,
        "hours_per_week": body.hours_per_week,
        "current_income": body.current_income,
        "current_skills": [skill for skill in body.skills],
    }

    simulate_result = await simulator.run(input_data)

    stmt = await db.execute(
        select(Simulation).where(
            Simulation.user_id == current_user.id,
            Simulation.target_job == body.target_job,
        )
    )
    existing_simulation = stmt.scalar_one_or_none()

    if existing_simulation:
        existing_simulation.input_data = input_data
        existing_simulation.salary_growth = simulate_result["salary_growth"]
        existing_simulation.time_estimate = simulate_result["time_estimate"]
        existing_simulation.market_analysis = simulate_result["market_analysis"]
        existing_simulation.recommended_skills = simulate_result["recommended_skills"]
        await db.commit()
        await db.refresh(existing_simulation)
        return existing_simulation

    simulation = Simulation(
        user_id=current_user.id,
        target_job=body.target_job,
        input_data=input_data,
        salary_growth=simulate_result["salary_growth"],
        time_estimate=simulate_result["time_estimate"],
        market_analysis=simulate_result["market_analysis"],
        recommended_skills=simulate_result["recommended_skills"],
    )

    db.add(simulation)
    await db.commit()
    await db.refresh(simulation)
    return simulation


@router.get("/latest", response_model=SimulationResponse)
async def get_latest_simulation(current_user: CurrentUser, db: SessionDep):
    result = await db.execute(
        select(Simulation)
        .where(Simulation.user_id == current_user.id)
        .order_by(Simulation.created_at.desc())
    )
    simulation = result.scalars().first()

    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found.")

    return simulation


@router.get("/simulations", response_model=list[SimulationResponse])
async def get_simulations(current_user: CurrentUser, db: SessionDep):
    result = await db.execute(
        select(Simulation)
        .where(Simulation.user_id == current_user.id)
        .order_by(Simulation.created_at.desc())
    )
    return list(result.scalars().all())


@router.get("/simulations/{id}", response_model=SimulationResponse)
async def get_simulation(id: int, current_user: CurrentUser, db: SessionDep):
    result = await db.execute(
        select(Simulation).where(
            Simulation.id == id,
            Simulation.user_id == current_user.id,
        )
    )
    simulation = result.scalar_one_or_none()

    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found.")

    return simulation


@router.post("/simulate/advanced")
async def run_advanced_simulation():
    return None
