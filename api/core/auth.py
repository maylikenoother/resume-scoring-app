from datetime import datetime
from typing import Optional, Dict, Any
import json
import base64
import httpx
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.core.config import settings
from api.core.database import get_db
from api.models.models import User
from api.schemas.schemas import UserCreate

security = HTTPBearer()

async def get_clerk_jwks() -> Dict[str, Any]:
    """Fetch the JWKS from Clerk's API to validate tokens"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.CLERK_FRONTEND_API}/.well-known/jwks.json"
        )
        response.raise_for_status()
        return response.json()

async def verify_clerk_jwt(token: str) -> Dict[str, Any]:
    """Verify a Clerk JWT token"""
    try:
        if not settings.CLERK_JWT_KEY:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="CLERK_JWT_KEY not configured"
            )
            
        header_b64, payload_b64, signature = token.split('.')
        
        padded_payload = payload_b64 + '=' * (-len(payload_b64) % 4)
        payload = json.loads(base64.b64decode(padded_payload))
        
        decoded_token = jwt.decode(
            token,
            settings.CLERK_JWT_KEY,
            algorithms=["HS256"],
            audience=settings.CLERK_AUDIENCE,
            issuer=f"{settings.CLERK_FRONTEND_API}"
        )
        
        return decoded_token
    except (jwt.JWTError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_user_by_clerk_id(db: AsyncSession, clerk_user_id: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.clerk_user_id == clerk_user_id))
    return result.scalars().first()

async def create_user_from_clerk(
    db: AsyncSession, 
    clerk_user_id: str, 
    email: Optional[str] = None, 
    full_name: Optional[str] = None
) -> User:

    new_user = User(
        clerk_user_id=clerk_user_id,
        email=email,
        full_name=full_name,
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    from api.models.models import CreditBalance
    credit_balance = CreditBalance(
        user_id=new_user.id,
        balance=settings.DEFAULT_CREDITS
    )
    db.add(credit_balance)
    await db.commit()
    
    return new_user

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Dependency to get current user from Clerk JWT token"""
    token = credentials.credentials
    payload = await verify_clerk_jwt(token)
    
    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await get_user_by_clerk_id(db, clerk_user_id)
    
    if not user:
        email = payload.get("email")
        full_name = payload.get("name") or payload.get("full_name")
        user = await create_user_from_clerk(db, clerk_user_id, email, full_name)
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user