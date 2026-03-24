from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List


class User(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    age: int
    gender: Optional[str] = None
    marital_status: Optional[str] = None

    @field_validator('age')
    def age_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Age must be a positive integer')
        return v

class Skill(BaseModel):
    name: str
    level: int

class SimulationRequest(BaseModel):
    skills: List[Skill]
    user_data: User
    hours_per_week: int
    target_income: float

    @field_validator('hours_per_week')
    def hours_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Hours per week must be a positive integer')
        return v

class UserUpdate(User):
    pass

class Skills(BaseModel):
    name: str
    id: int

