from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, DateTime, Float, ForeignKey, JSON, Text, func

from database.db import Base


class TokenBlackList(Base):
    __tablename__ = "token_blacklist"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    blacklisted_on: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    token: Mapped[str] = mapped_column(String)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    username: Mapped[str] = mapped_column(String, unique=True)
    password: Mapped[str] = mapped_column(String)

    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)


    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    age: Mapped[int] = mapped_column(Integer, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    marital_status: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String)
    level: Mapped[int] = mapped_column(Integer)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    simulation_id: Mapped[int] = mapped_column(ForeignKey("simulations.id"))

    user = relationship("User", backref="skills")


class Simulation(Base):
    __tablename__ = "simulations"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    target_job: Mapped[str] = mapped_column(String, default="")
    input_data: Mapped[dict] = mapped_column(JSON)
    time_estimate: Mapped[dict] = mapped_column(JSON)
    market_analysis: Mapped[dict] = mapped_column(JSON)
    salary_growth: Mapped[float] = mapped_column(Float)
    recommended_skills: Mapped[list] = mapped_column(JSON, default=[])

    # expected_income: Mapped[float] = mapped_column(Float)
    # roi: Mapped[float] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    user = relationship("User", backref="simulations")
    skills = relationship("Skill", backref="simulations")

class JobProfile(Base):
    __tablename__ = "job_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    target_job: Mapped[str] = mapped_column(String)
    target_salary: Mapped[int] = mapped_column(Integer)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user = relationship("User", backref="job_profiles")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    priority: Mapped[str] = mapped_column(String, default="medium")  # low, medium, high
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    phase_id: Mapped[int] = mapped_column(ForeignKey("phases.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    user = relationship("User", backref="tasks")
    phase = relationship("Phase", back_populates="tasks")

class Phase(Base):
    __tablename__ = "phases"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String)
    duration_weeks: Mapped[int] = mapped_column(Integer, default=0)
    hours: Mapped[int] = mapped_column(Integer, default=0)
    topics: Mapped[list] = mapped_column(JSON, default=list)
    resources: Mapped[list] = mapped_column(JSON, default=list)

    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"))
    plan = relationship("Plan", back_populates="phases")
    tasks = relationship("Task", back_populates="phase", cascade="all, delete-orphan")


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String)

    target_job: Mapped[str] = mapped_column(String)
    total_weeks: Mapped[int] = mapped_column(Integer, default=0)
    total_hours: Mapped[int] = mapped_column(Integer, default=0)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    simulation_id: Mapped[Optional[int]] = mapped_column(ForeignKey("simulations.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    user = relationship("User", backref="plans")
    phases = relationship("Phase", back_populates="plan", cascade="all, delete-orphan")


class NotificationSetting(Base):
    __tablename__ = "notification_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)

    deadline_reminders: Mapped[bool] = mapped_column(Boolean, default=True)
    task_updates: Mapped[bool] = mapped_column(Boolean, default=True)
    market_news: Mapped[bool] = mapped_column(Boolean, default=False)
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=False)

    reminder_hours_before: Mapped[int] = mapped_column(Integer, default=24)

    user = relationship("User", backref="notification_settings")