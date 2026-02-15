"""
Green Matchers - Main FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.backend.core.config import get_settings
from apps.backend.core.logging import setup_logging
from apps.backend.core.exceptions import register_exception_handlers
from apps.backend.core.security_headers import SecurityHeadersMiddleware

from apps.backend.routes import (
    auth_router,
    users_router,
    jobs_router,
    careers_router,
    applications_router,
    analytics_router,
    admin_router,
    ai_router,
    search_router,
    preferences_router,
)

# Setup logging
setup_logging()

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Register exception handlers
register_exception_handlers(app)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(jobs_router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(careers_router, prefix="/api/careers", tags=["Careers"])
app.include_router(applications_router, prefix="/api/applications", tags=["Applications"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])
app.include_router(search_router, prefix="/api/search", tags=["Search"])
app.include_router(preferences_router, prefix="/api/preferences", tags=["Preferences"])


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Green Matchers API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "green-matchers-api",
        "version": settings.APP_VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
