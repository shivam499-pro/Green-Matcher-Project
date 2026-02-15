
"""
Green Matchers - Dependency Injection (Simplified for debugging)
Provides common dependencies for FastAPI routes.
"""
from datetime import datetime
from fastapi import Depends, HTTPException, status
from typing import Annotated
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from apps.backend.db import get_db
from apps.backend.models.user import User, UserRole

# HTTP Bearer token scheme with auto_error=False for optional auth
security = HTTPBearer(auto_error=False)


# Type alias for database session
DatabaseSession = Annotated[Session, Depends(get_db)]


def get_role(user) -> str:
    return user.role


class MockUser:
    """Mock user for debugging - behaves like real ORM object."""
    def __init__(self, user_id: int = 1, role: str = "USER"):
        self.id = user_id
        self.email = "demo@greenmatcher.ai"
        self.full_name = "Demo User"
        self.role = UserRole.EMPLOYER if role == "EMPLOYER" else UserRole.USER
        self.skills = ["Python", "React", "SQL"]
        self.resume_url = None
        self.language = "en"
        self.company_name = "Green Matchers Inc."
        self.company_description = "Sustainable job matching platform"
        self.company_website = "https://greenmatcher.ai"
        self.is_verified = 1
        self.email_notifications = 1
        self.job_alerts = 1
        self.application_updates = 1
        self.profile_visibility = "public"
        self.timezone = "UTC"
        self.theme = "light"
        self.preferences = None
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.password_hash = "mock_hash"


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: DatabaseSession
) -> User:
    """
    DEBUG MODE:
    Returns employer user for testing.
    """
    return MockUser(user_id=20, role="EMPLOYER")


async def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: DatabaseSession
) -> User | None:
    """
    Get the current authenticated user from JWT token (optional).
    Returns None if no valid token is provided.
    """
    # Return mock user for debugging
    return MockUser()


def require_role(required_role: UserRole):
    """
    Check if the current user has the required role.
    
    Usage:
        @router.get("/admin-only")
        def admin_endpoint(
            current_user: User = Depends(require_role(UserRole.ADMIN))
        ):
            return {"message": "Welcome Admin"}
    """
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires {required_role} role"
            )
        return current_user
    return dependency
