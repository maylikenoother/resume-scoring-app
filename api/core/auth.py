from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional
import httpx

from app.core.config import get_settings
from app.models.schemas import TokenData

settings = get_settings()
security = HTTPBearer()

async def verify_clerk_token(token: str) -> dict:
    """
    Verify a Clerk JWT token and return the payload
    """
    try:
        # In a production environment, you would use the Clerk public key to verify the token
        # For development, we'll use a simplified approach
        if not settings.CLERK_JWT_PUBLIC_KEY:
            # Mock verification for development
            # In production, this would be a proper JWT verification
            payload = jwt.decode(
                token, 
                "mock_secret_key", 
                algorithms=["HS256"],
                options={"verify_signature": False}
            )
            return payload
        
        # Production verification would use the Clerk public key
        payload = jwt.decode(
            token,
            settings.CLERK_JWT_PUBLIC_KEY,
            algorithms=["RS256"],
            audience=settings.APP_NAME
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Get the current user's Clerk ID from the JWT token
    """
    token = credentials.credentials
    payload = await verify_clerk_token(token)
    
    # Extract user ID from Clerk token
    clerk_id: Optional[str] = payload.get("sub")
    if clerk_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = TokenData(clerk_id=clerk_id)
    return token_data.clerk_id
