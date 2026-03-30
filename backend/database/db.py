from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

import os
from dotenv import load_dotenv
from typing import Annotated

from sqlalchemy.orm import DeclarativeBase

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_async_engine(SQLALCHEMY_DATABASE_URL)
session = async_sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with session() as db:
        yield db

SessionDep = Annotated[AsyncSession, Depends(get_db)]
