from datetime import datetime
from typing import Optional, Dict, Any
import json
import base64
import httpx
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, jwk
from jose.utils import base64url_decode
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from api.core.config import settings
from api.core.database import get_db
from api.models.models import User
from api.schemas.schemas import UserCreate

logger = logging.getLogger(__name__)
security = HTTPBearer()

_JWKS_CACHE = None
_JWKS_CACHE_TIMESTAMP = None

async def get_clerk_jwks() -> Dict[str, Any]:
    """Fetch the JWKS from Clerk's API to validate tokens"""
    global _JWKS_CACHE, _JWKS_CACHE_TIMESTAMP
    
    current_time = datetime.now()
    if _JWKS_CACHE and _JWKS_CACHE_TIMESTAMP and \
       (current_time - _JWKS_CACHE_TIMESTAMP).total_seconds() < 3600:
        return _JWKS_CACHE
    
    try:
        async with httpx.AsyncClient() as client:
            jwks_url = f"{settings.CLERK_FRONTEND_API}/.well-known/jwks.json"
            logger.info(f"Fetching JWKS from {jwks_url}")
            response = await client.get(jwks_url)
            response.raise_for_status()
            _JWKS_CACHE = response.json()
            _JWKS_CACHE_TIMESTAMP = current_time
            return _JWKS_CACHE
    except Exception as e:
        logger.error(f"Error fetching JWKS: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch JWKS: {str(e)}"
        )

async def verify_clerk_jwt(token: str) -> Dict[str, Any]:
    """Verify a Clerk JWT token using RS256 and JWKS"""
    try:
        header_segment = token.split('.')[0]
        padded_header = header_segment + '=' * (4 - len(header_segment) % 4)
        header_data = json.loads(base64.b64decode(padded_header).decode('utf-8'))
        
        kid = header_data.get('kid')
        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No 'kid' found in JWT header",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        jwks = await get_clerk_jwks()
        
        key_data = None
        for key in jwks.get('keys', []):
            if key.get('kid') == kid:
                key_data = key
                break
        
        if not key_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No matching key found in JWKS",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        public_key = jwk.construct(key_data)
        
        payload = jwt.decode(
            token,
            public_key.to_pem().decode('utf-8'),
            algorithms=[key_data.get('alg', 'RS256')],
            audience=settings.CLERK_AUDIENCE,
            options={"verify_exp": True, "verify_signature": True}
        )
        
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTClaimsError as e:
        logger.warning(f"JWT claims validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"JWT claims validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (jwt.JWTError, ValidationError, Exception) as e:
        logger.error(f"Invalid token: {e}")
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
    
    try:
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
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user