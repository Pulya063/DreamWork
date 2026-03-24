from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_async_engine(SQLALCHEMY_DATABASE_URL)
session = AsyncSession(engine, expire_on_commit=False, autoflush=False)

class Base(declarative_base()):
    pass

async def get_db():
    async with session as db:
        yield db

