# api/auth/routes.py (update)
from datetime import timedelta
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel

from api.core.security import create_access_token, create_refresh_token, get_password_hash, verify_password
from api.config.settings import settings
from api.db.database import get_db
from api.db.models import User, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class RefreshToken(BaseModel):
    refresh_token: str


@router.post("/register", response_model=UserRead)
def register_user(*, db: Session = Depends(get_db), user_in: UserCreate) -> Any:
    """
    Register a new user.
    
    Args:
        db: Database session
        user_in: User registration data
        
    Returns:
        Created user
        
    Raises:
        HTTPException: If email already exists
    """
    # Check if user with this email already exists
    user = db.exec(select(User).where(User.email == user_in.email)).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )
    
    # Create new user with hashed password
    db_user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        credits=0  # Start with 0 credits
    )
    
    # Add to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    
    Args:
        db: Database session
        form_data: Form with username (email) and password
        
    Returns:
        Access token
        
    Raises:
        HTTPException: If authentication fails
    """
    # Get user by email (form_data.username contains the email)
    user = db.exec(select(User).where(User.email == form_data.username)).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    
    # Create refresh token
    refresh_token_expires = timedelta(minutes=settings.access_token_expire_minutes * 2)
    refresh_token = create_refresh_token(
        subject=user.email, expires_delta=refresh_token_expires
    )
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
def refresh_token(
    db: Session = Depends(get_db), 
    refresh_token_in: RefreshToken = None
) -> Any:
    """
    Refresh access token using a refresh token.
    
    Args:
        db: Database session
        refresh_token_in: Refresh token
        
    Returns:
        New access token and refresh token
        
    Raises:
        HTTPException: If refresh token is invalid
    """
    try:
        payload = jwt.decode(
            refresh_token_in.refresh_token, 
            settings.secret_key, 
            algorithms=[settings.algorithm]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        email = payload["sub"]
        user = db.exec(select(User).where(User.email == email)).first()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user or inactive user",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create new access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            subject=user.email, expires_delta=access_token_expires
        )
        
        # Create new refresh token
        refresh_token_expires = timedelta(minutes=settings.access_token_expire_minutes * 2)
        new_refresh_token = create_refresh_token(
            subject=user.email, expires_delta=refresh_token_expires
        )
        
        return {
            "access_token": access_token, 
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )