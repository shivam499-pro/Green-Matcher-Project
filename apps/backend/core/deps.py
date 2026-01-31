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

# HTTP Bearer token scheme
security = HTTPBearer()


# Type alias for database session
DatabaseSession = Annotated[Session, Depends(get_db)]


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: DatabaseSession
) -> dict:
    """
    Get the current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer credentials containing the JWT token
        db: Database session
        
    Returns:
        User payload from decoded token
        
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
    
    # Extract user ID and role from token
    user_id: str = payload.get("sub")
    role: str = payload.get("role")
    
    if user_id is None or role is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"user_id": user_id, "role": role}


async def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: DatabaseSession
) -> dict | None:
    """
    Get the current authenticated user from JWT token (optional).
    Returns None if no valid token is provided.
    
    Args:
        credentials: HTTP Bearer credentials containing the JWT token
        db: Database session
        
    Returns:
        User payload from decoded token, or None if invalid
    """
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        
        if payload is None:
            return None
        
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        
        if user_id is None or role is None:
            return None
        
        return {"user_id": user_id, "role": role}
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
    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. {required_role} role required."
            )
        return current_user
    
    return role_checker


# Pre-defined role dependencies
require_employer = require_role("EMPLOYER")
require_admin = require_role("ADMIN")
