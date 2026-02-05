"""
Green Matchers - Main FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings
from core.logging import setup_logging
from core.security_headers import SecurityHeadersMiddleware
from core.exceptions import register_exception_handlers
from core.rate_limit import limiter, rate_limit_exceeded_handler
from routes import (
    auth_router,
    users_router,
    jobs_router,
    careers_router,
    applications_router,
    analytics_router,
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

# Register global exception handlers
register_exception_handlers(app)

# Register rate limit exceeded handler
app.add_exception_handler(limiter._rate_limit_exceeded_handler.__func__, rate_limit_exceeded_handler)

# Add rate limiting
app.state.limiter = limiter

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
