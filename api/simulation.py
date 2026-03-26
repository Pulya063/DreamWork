"""
api/simulation.py
Ендпоінти: POST /simulate, GET /simulations, GET /simulations/{id}, POST /simulate/advanced
"""

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from database.db import SessionDep
from database.models import Simulation
from database.schemas import SimulationRequest, SimulationResponse
from api.auth import CurrentUser
from services.simulator import Simulator

router = APIRouter()
simulator = Simulator()


@router.post("/simulate", response_model=SimulationResponse)
async def run_simulation(body: SimulationRequest, current_user: CurrentUser, db: SessionDep):
    """
    Базова симуляція: аналіз навичок, час навчання, прогноз.
    Зберігає результат у БД.
    """

    input_data = {
        "target_job": body.target_job,
        "hours_per_week": body.hours_per_week,
        "current_income": body.current_income,
        "current_skills": [s for s in body.skills],
    }

    simulate_result = await simulator.run(input_data)

    result_data = {
        "recommended_skills": [skills for skills in simulate_result["recommended_skills"]],
        "time_estimate": simulate_result["time_estimate"],
        "market_analysis": simulate_result["market_analysis"],
        "salary_growth": simulate_result["salary_growth"]
    }

    sim = Simulation(
        user_id=current_user.id,
        target_job=body.target_job,
        input_data=input_data,
        salary_growth=result_data["salary_growth"],
        time_estimate=result_data["time_estimate"],
        market_analysis=result_data["market_analysis"],
        recommended_skills=result_data["recommended_skills"],
    )

    db.add(sim)
    await db.commit()
    await db.refresh(sim)

    return sim


@router.get("/simulations", response_model=list[SimulationResponse])
async def get_simulations(current_user: CurrentUser, db: SessionDep):
    """Історія всіх симуляцій користувача."""
    result = await db.execute(
        select(Simulation)
        .where(Simulation.user_id == current_user.id)
        .order_by(Simulation.created_at.desc())
    )
    return result.scalars().all()


@router.get("/simulations/{id}", response_model=SimulationResponse)
async def get_simulation(id: int, current_user: CurrentUser, db: SessionDep):
    """Деталі конкретної симуляції з задачами та roadmap."""
    result = await db.execute(
        select(Simulation).where(
            Simulation.id == id,
            Simulation.user_id == current_user.id,
        )
    )
    sim = result.scalar_one_or_none()

    if not sim:
        raise HTTPException(status_code=404, detail="Симуляцію не знайдено.")

    return sim


@router.post("/simulate/advanced")
async def run_advanced_simulation():
    pass
