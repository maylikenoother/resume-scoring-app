from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from api.core.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_current_active_user,
)
from api.core.config import settings
from api.core.database import get_db
from api.models.models import User, CreditBalance
from api.schemas.schemas import Token, UserCreate, User as UserSchema

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={401: {"description": "Unauthorized"}},
)

@router.post("/login", response_model=Token)
async def login_for_access_token(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register_new_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> Any:
    user = await db.execute(
        "SELECT id FROM users WHERE email = :email",
        {"email": user_in.email}
    )
    if user.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_password
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    credit_balance = CreditBalance(
        user_id=new_user.id,
        balance=settings.DEFAULT_CREDITS
    )
    db.add(credit_balance)
    await db.commit()
    
    return new_user

@router.get("/me", response_model=UserSchema)
async def read_users_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    return current_user