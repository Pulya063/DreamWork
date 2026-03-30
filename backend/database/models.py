from datetime import datetime
from typing import Optional, List

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, DateTime, Float, ForeignKey, JSON, Text, func

from backend.database.db import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True)
    password: Mapped[str] = mapped_column(String)

    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)

    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    age: Mapped[Optional[int]] = mapped_column(Integer)
    gender: Mapped[Optional[str]] = mapped_column(String)
    marital_status: Mapped[Optional[str]] = mapped_column(String)

    # Relationships
    skills: Mapped[List["Skill"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    simulations: Mapped[List["Simulation"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    job_profiles: Mapped[List["JobProfile"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    plans: Mapped[List["Plan"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    tasks: Mapped[List["Task"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    notification_settings: Mapped["NotificationSetting"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped["User"] = relationship(back_populates="skills")


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

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    user: Mapped["User"] = relationship(back_populates="simulations")
    plans: Mapped[List["Plan"]] = relationship(back_populates="simulation", cascade="all, delete-orphan")


class JobProfile(Base):
    __tablename__ = "job_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    target_job: Mapped[str] = mapped_column(String)
    target_salary: Mapped[int] = mapped_column(Integer)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped["User"] = relationship(back_populates="job_profiles")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(Text)
    topic: Mapped[str] = mapped_column(String)

    priority: Mapped[str] = mapped_column(String, default="medium")  # low, medium, high
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    phase_id: Mapped[Optional[int]] = mapped_column(ForeignKey("phases.id"))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="tasks")
    phase: Mapped["Phase"] = relationship(back_populates="tasks")


class Phase(Base):
    __tablename__ = "phases"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String)
    duration_weeks: Mapped[int] = mapped_column(Integer, default=0)
    hours: Mapped[int] = mapped_column(Integer, default=0)
    topics: Mapped[list] = mapped_column(JSON, default=list)
    resources: Mapped[list] = mapped_column(JSON, default=list)

    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"))

    plan: Mapped["Plan"] = relationship(back_populates="phases")
    tasks: Mapped[List["Task"]] = relationship(back_populates="phase", cascade="all, delete-orphan")


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String)

    target_job: Mapped[str] = mapped_column(String)
    total_weeks: Mapped[int] = mapped_column(Integer, default=0)
    total_hours: Mapped[int] = mapped_column(Integer, default=0)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    simulation_id: Mapped[Optional[int]] = mapped_column(ForeignKey("simulations.id"))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    user: Mapped["User"] = relationship(back_populates="plans")
    simulation: Mapped[Optional["Simulation"]] = relationship(back_populates="plans")
    phases: Mapped[List["Phase"]] = relationship(back_populates="plan", cascade="all, delete-orphan")


class NotificationSetting(Base):
    __tablename__ = "notification_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)

    deadline_reminders: Mapped[bool] = mapped_column(Boolean, default=True)
    task_updates: Mapped[bool] = mapped_column(Boolean, default=True)
    market_news: Mapped[bool] = mapped_column(Boolean, default=False)
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=False)

    reminder_hours_before: Mapped[int] = mapped_column(Integer, default=24)

    user: Mapped["User"] = relationship(back_populates="notification_settings")
