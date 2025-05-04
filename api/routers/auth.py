from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from api.core.auth import (
    get_current_active_user,
    validate_resource_ownership
)
from api.core.database import get_db
from api.models.models import User, UserRole
from api.schemas.schemas import User as UserSchema

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={401: {"description": "Unauthorized"}},
)

@router.get("/me", response_model=UserSchema)
async def read_users_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:

    return current_user

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    
@router.patch("/me", response_model=UserSchema)
async def update_user_profile(
    update_data: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    needs_update = False
    
    if update_data.full_name is not None and update_data.full_name != current_user.full_name:
        current_user.full_name = update_data.full_name
        needs_update = True
    
    if needs_update:
        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)
    
    return current_user

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
    if current_user.clerk_user_id != user_info.clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID mismatch"
        )
    
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