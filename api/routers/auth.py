from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.core.clerk_auth import clerk_auth
from app.models.schemas import UserCreate, UserResponse
from app.services.user_service import create_user, get_user_by_clerk_id

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={404: {"description": "Not found"}},
)

@router.post("/webhook", status_code=status.HTTP_200_OK)
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Webhook endpoint for Clerk events
    
    This endpoint receives webhook events from Clerk when users are created,
    updated, or deleted. It syncs the user data with our database.
    """
    # Verify webhook signature (in production)
    # For development, we'll skip this step
    
    # Parse webhook payload
    payload = await request.json()
    event_type = payload.get("type")
    
    if event_type == "user.created":
        # Extract user data
        user_data = payload.get("data", {})
        clerk_id = user_data.get("id")
        email = user_data.get("email_addresses", [{}])[0].get("email_address", "")
        
        if clerk_id and email:
            # Check if user already exists
            existing_user = await get_user_by_clerk_id(db, clerk_id)
            if not existing_user:
                # Create new user
                user_create = UserCreate(clerk_id=clerk_id, email=email)
                await create_user(db, user_create)
    
    # Return success response
    return {"status": "success"}

@router.get("/session", response_model=Dict[str, Any])
async def get_session(request: Request):
    """
    Get current session information
    
    This endpoint returns the current user's session information
    based on the JWT token in the Authorization header
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
    
    return {
        "session": payload,
        "authenticated": True
    }
