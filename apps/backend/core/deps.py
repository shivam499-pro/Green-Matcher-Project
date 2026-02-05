"""
Green Matchers - Dependency Injection
Provides common dependencies for FastAPI routes.
"""
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from utils.db import get_db
from core.security import decode_access_token
from models.user import User

# HTTP Bearer token scheme with auto_error=False for optional auth
security = HTTPBearer(auto_error=False)


# Type alias for database session
DatabaseSession = Annotated[Session, Depends(get_db)]


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: DatabaseSession
) -> User:
    """
    Get the current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer credentials containing the JWT token
        db: Database session
        
    Returns:
        User object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract user ID from token
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch user from database
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: DatabaseSession
) -> User | None:
    """
    Get the current authenticated user from JWT token (optional).
    Returns None if no valid token is provided.
    
    Args:
        credentials: HTTP Bearer credentials containing the JWT token (can be None)
        db: Database session
        
    Returns:
        User object, or None if invalid/missing
    """
    # Handle case where credentials is None (no Authorization header)
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        
        if payload is None:
            return None
        
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        user = db.query(User).filter(User.id == int(user_id)).first()
        return user
    except Exception:
        return None


async def require_role(required_role: str):
    """
    Create a dependency that requires a specific user role.
    
    Args:
        required_role: The required role (USER, EMPLOYER, ADMIN)
        
    Returns:
        Dependency function that checks user role
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. {required_role} role required."
            )
        return current_user
    
    return role_checker


# Pre-defined role dependencies
require_user = require_role("USER")
require_employer = require_role("EMPLOYER")
require_admin = require_role("ADMIN")
