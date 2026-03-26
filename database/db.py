from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv
from typing import Annotated

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_async_engine(SQLALCHEMY_DATABASE_URL)
session = AsyncSession(engine, expire_on_commit=False, autoflush=False)

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

async def get_db():
    async with session as db:
        yield db

SessionDep = Annotated[AsyncSession, Depends(get_db)]
