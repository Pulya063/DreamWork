import uuid
from datetime import datetime, timedelta, timezone
import os
from typing import Annotated
from redis.asyncio import Redis

from fastapi import Depends, HTTPException, status, APIRouter, Response, Cookie
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy import select


from backend.database.db import SessionDep
from backend.database.models import User
from backend.database.schemas import UserRegister, UserResponse
import os
from dotenv import load_dotenv

load_dotenv()


# --- Configuration ---
ALGORITHM = os.getenv("ALGORITHM", "HS256")
SECRET_KEY = os.getenv("SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

if SECRET_KEY is None:
    raise ValueError("SECRET_KEY environment variable not set.")
router = APIRouter()

r = Redis(host='localhost', port=6379)


# --- Security & Hashing ---
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def hash_password(password: str) -> str:
    """Hashes a plain-text password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


# --- Token Creation ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    jti = str(uuid.uuid4())  # унікальний ID для rotation
    to_encode.update({"exp": expire, "type": "refresh", "jti": jti})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    # зберігаємо в Redis з TTL
    await r.set(f"refresh:{jti}", data["sub"], ex=REFRESH_TOKEN_EXPIRE_DAYS*24*3600)
    return token


# --- User Dependency ---
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: SessionDep) -> User:
    """
    Decodes the JWT token, validates it, and returns the current user.
    Raises HTTPException if the token is invalid, expired, or blacklisted.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Доступ заборонено",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("type")

        if username is None or token_type != "access":
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Get user from database
    result = await db.execute(select(User).where(User.username == username))

    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception

    return user

CurrentUser = Annotated[User, Depends(get_current_user)]




# --- API Endpoints ---
@router.post('/register', status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def register(user_data: UserRegister, db: SessionDep):
    # Check for existing user with the same email
    db_user = await db.execute(select(User).where(User.email == user_data.email))
    user = db_user.first()

    if user and (user.email or user.username):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    # Create new user and cart in a single transaction
    hashed_password = hash_password(user_data.password)
    new_user = User(**user_data.model_dump(exclude={"password", "confirm_password"}), password=hashed_password)

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


@router.post('/login')
async def login(response: Response, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: SessionDep):
    """Authenticates a user and returns access and refresh tokens."""
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token({"sub": user.username})
    refresh_token = await create_refresh_token({"sub": user.username})

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="strict",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post('/logout', status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response, current_user: CurrentUser, db: SessionDep, refresh_token: str = Cookie(None)):
    """Logs out the current user by blacklisting their access token."""
    if refresh_token:
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            jti = payload.get("jti")
            await r.delete(f"refresh:{jti}")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

    response.delete_cookie("refresh_token")
    current_user.last_logout_at = datetime.now(timezone.utc)
    db.add(current_user)

    await db.commit()
    return None


@router.post("/refresh")
async def refresh_token_endpoint(response: Response, refresh_token: str = Cookie(None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=403, detail="Invalid token type")
        jti = payload.get("jti")
        username = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")

    # перевірка в Redis
    if not await r.get(f"refresh:{jti}"):
        raise HTTPException(status_code=403, detail="Refresh token expired or revoked")

    # ROTATION: видаляємо старий
    await r.delete(f"refresh:{jti}")

    # генеруємо нові токени
    access_token = create_access_token({"sub": username})
    new_refresh_token = await create_refresh_token({"sub": username})

    # віддаємо новий refresh токен
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False,
        samesite="strict",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS*24*3600
    )

    return {"access_token": access_token, "token_type": "bearer"}


# @router.post('/change-password', status_code=status.HTTP_200_OK)
# async def change_password(
#         current_user: CurrentUser,
#         db: SessionDep,
#         new_password: str = Body(..., embed=True, min_length=8)
# ):
#     """Allows an authenticated user to change their password."""
#     current_user.password = hash_password(new_password)
#     db.add(current_user)
#     await db.commit()
#     return {"message": "Password updated successfully"}
# 
# 
# @router.post("/forgot-password", status_code=status.HTTP_200_OK)
# async def forgot_password(user_email: UserForgotPassword, db: SessionDep):
#     """Initiates the password reset process for a user."""
#     result = await db.execute(select(User).where(User.email == user_email.email))
#     db_user = result.scalar_one_or_none()
# 
#     if not db_user:
#         pass
# 
#     # In a real application, you would send a password reset email here.
#     # For example: await send_password_reset_email(db_user)
# 
#     return {"message": "If an account with that email exists, a password reset link has been sent."}
