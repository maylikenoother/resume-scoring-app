from typing import List, Optional, Callable, Any
from functools import wraps
from fastapi import HTTPException, status, Depends
from api.models.models import User, UserRole
from api.core.auth import get_current_active_user

class RoleChecker:

    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles
    
    def __call__(self, user: User = Depends(get_current_active_user)) -> User:

        if not user.role or user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to access this resource",
            )
        return user

admin_only = RoleChecker([UserRole.ADMIN])
all_users = RoleChecker([UserRole.ADMIN, UserRole.USER])

def requires_permission(permission_func: Callable[[User, Any], bool]):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(get_current_active_user), **kwargs):
            if not permission_func(current_user, *args, **kwargs):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions to access this resource",
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

async def validate_resource_ownership(user_id: int, resource_user_id: int) -> bool:

    if user_id != resource_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource",
        )
    return True