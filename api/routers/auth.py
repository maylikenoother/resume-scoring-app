from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from api.core.auth import (
    get_current_active_user
)
from api.core.database import get_db
from api.models.models import User
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
