from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional, Dict, Any
import httpx

from app.core.config import get_settings

settings = get_settings()
security = HTTPBearer()

class ClerkAuth:
    """
    Clerk authentication helper class
    """
    def __init__(self):
        self.api_key = settings.CLERK_API_KEY
        self.jwt_public_key = settings.CLERK_JWT_PUBLIC_KEY
    
    async def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verify a Clerk JWT token
        
        In production, this would use the Clerk public key to verify the token
        For development, we'll use a simplified approach
        """
        try:
            if not self.jwt_public_key:
                # Mock verification for development
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
                self.jwt_public_key,
                algorithms=["RS256"],
                audience=settings.APP_NAME
            )
            return payload
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication credentials: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    async def get_user_data(self, clerk_id: str) -> Dict[str, Any]:
        """
        Get user data from Clerk API
        
        In production, this would make a request to the Clerk API
        For development, we'll return mock data
        """
        if not self.api_key:
            # Return mock data for development
            return {
                "id": clerk_id,
                "email": f"user_{clerk_id}@example.com",
                "first_name": "Test",
                "last_name": "User",
            }
        
        # In production, make a request to the Clerk API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.clerk.dev/v1/users/{clerk_id}",
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to get user data from Clerk",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            return response.json()

clerk_auth = ClerkAuth()

async def get_current_user(request: Request) -> Dict[str, Any]:
    """
    Get the current user from the request
    
    This function extracts the JWT token from the Authorization header,
    verifies it, and returns the user data
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_header.split(" ")[1]
    payload = await clerk_auth.verify_token(token)
    
    # Extract user ID from Clerk token
    clerk_id: Optional[str] = payload.get("sub")
    if clerk_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user data from Clerk
    user_data = await clerk_auth.get_user_data(clerk_id)
    
    return {
        "clerk_id": clerk_id,
        "email": user_data.get("email", ""),
        "first_name": user_data.get("first_name", ""),
        "last_name": user_data.get("last_name", ""),
    }
