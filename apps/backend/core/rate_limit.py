"""
Green Matchers - Rate Limiting Middleware
"""
from fastapi import Request, Response, HTTPException, status
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging

logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/hour", "1000/day"],
    storage_uri="memory://",
    headers_enabled=True
)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """Custom handler for rate limit exceeded."""
    logger.warning(f"Rate limit exceeded for {request.client.host}")
    return Response(
        content='{"detail": "Rate limit exceeded. Please try again later."}',
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        media_type="application/json"
    )


# Set custom handler
limiter._rate_limit_exceeded_handler = rate_limit_exceeded_handler
