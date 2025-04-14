from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user_id
from app.models.schemas import UserCreate, UserResponse, CreditBalanceResponse
from app.services.user_service import create_user, get_user_by_clerk_id, get_credit_balance

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user with Clerk authentication
    """
    db_user = await get_user_by_clerk_id(db, user.clerk_id)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already registered"
        )
    return await create_user(db=db, user=user)

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    clerk_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get current user information
    """
    db_user = await get_user_by_clerk_id(db, clerk_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user

@router.get("/me/credits", response_model=CreditBalanceResponse)
async def read_user_credits(
    clerk_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get current user's credit balance
    """
    db_user = await get_user_by_clerk_id(db, clerk_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    credit_balance = await get_credit_balance(db, db_user.id)
    if credit_balance is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit balance not found"
        )
    
    return credit_balance
