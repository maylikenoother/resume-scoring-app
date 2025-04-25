from datetime import timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from api.core.auth import (
    get_current_active_user,
    router as auth_core_router,
    update_user_token,
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

# Include the core auth routes (like store-token)
router.include_router(auth_core_router)

@router.get("/me", response_model=UserSchema)
async def read_users_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    return current_user

class TokenData(BaseModel):
    token: str

@router.post("/store-token")
async def store_auth_token(
    token_data: TokenData,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Store a Clerk JWT token in the database"""
    try:
        token = token_data.token
        if not token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token is required"
            )
            
        # Update user's token
        await update_user_token(db, current_user, token)
        
        return {"message": "Token stored successfully"}
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error storing token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store token: {str(e)}"
        )

class ClerkUserInfo(BaseModel):
    clerk_user_id: str
    email: Optional[str] = None
    full_name: Optional[str] = None

@router.post("/clerk-sync")
async def sync_clerk_user(
    user_info: ClerkUserInfo,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Synchronize user information from Clerk
    """
    if current_user.clerk_user_id != user_info.clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID mismatch"
        )
    
    # Update user information if needed
    update_needed = False
    
    if user_info.email and current_user.email != user_info.email:
        current_user.email = user_info.email
        update_needed = True
        
    if user_info.full_name and current_user.full_name != user_info.full_name:
        current_user.full_name = user_info.full_name
        update_needed = True
    
    if update_needed:
        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)
    
    return {"status": "success", "user_id": current_user.id}