"""
Green Matchers - API Routes
"""
from .auth import router as auth_router
from .users import router as users_router
from .jobs import router as jobs_router
from .careers import router as careers_router
from .applications import router as applications_router
from .analytics import router as analytics_router

__all__ = [
    "auth_router",
    "users_router",
    "jobs_router",
    "careers_router",
    "applications_router",
    "analytics_router",
]
