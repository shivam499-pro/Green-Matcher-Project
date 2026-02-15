"""
Green Matchers - API Routes
"""
from .auth import router as auth_router
from .users import router as users_router
from .jobs import router as jobs_router
from .careers import router as careers_router
from .applications import router as applications_router
from .analytics import router as analytics_router
from .ai import router as ai_router
from .search import router as search_router
from .preferences import router as preferences_router
from .admin import router as admin_router

__all__ = [
    "auth_router",
    "users_router",
    "jobs_router",
    "careers_router",
    "applications_router",
    "analytics_router",
    "ai_router",
    "search_router",
    "preferences_router",
    "admin_router",
]
