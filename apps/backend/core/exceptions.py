"""
Green Matchers - Global Exception Handler (FIXED)
"""
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging
from fastapi.exceptions import HTTPException


logger = logging.getLogger(__name__)


class NotFoundException(Exception):
    """Resource not found exception."""
    def __init__(self, detail: str = "Resource not found"):
        self.detail = detail
        super().__init__(detail)


class ForbiddenException(Exception):
    """Access forbidden exception."""
    def __init__(self, detail: str = "Access denied"):
        self.detail = detail
        super().__init__(detail)


class BadRequestException(Exception):
    """Bad request exception."""
    def __init__(self, detail: str = "Bad request"):
        self.detail = detail
        super().__init__(detail)


def register_exception_handlers(app: FastAPI):
    """Register global exception handlers for the FastAPI app."""
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """
        Handle Pydantic validation errors.
        Fixed to properly serialize errors with bytes input.
        """
        logger.warning(f"Validation error: {exc.errors()}")
        
        # Clean the errors to make them JSON serializable
        cleaned_errors = []
        for error in exc.errors():
            cleaned_error = {}
            for key, value in error.items():
                if key == 'input' and isinstance(value, bytes):
                    # Convert bytes to string for JSON serialization
                    cleaned_error[key] = value.decode('utf-8', errors='replace')
                elif key == 'ctx' and isinstance(value, dict):
                    # Clean context dict if it contains bytes
                    cleaned_ctx = {}
                    for ctx_key, ctx_value in value.items():
                        if isinstance(ctx_value, bytes):
                            cleaned_ctx[ctx_key] = ctx_value.decode('utf-8', errors='replace')
                        else:
                            cleaned_ctx[ctx_key] = ctx_value
                    cleaned_error[key] = cleaned_ctx
                else:
                    cleaned_error[key] = value
            cleaned_errors.append(cleaned_error)
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": "Validation error",
                "errors": cleaned_errors
            }
        )
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        """Handle SQLAlchemy database errors."""
        logger.error(f"Database error: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Database error occurred. Please try again later."
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle all other exceptions."""
        logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "An unexpected error occurred. Please try again later."
            }
        )
    
    @app.exception_handler(NotFoundException)
    async def not_found_exception_handler(request: Request, exc: NotFoundException):
        """Handle NotFoundException."""
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": exc.detail}
        )
    
    @app.exception_handler(ForbiddenException)
    async def forbidden_exception_handler(request: Request, exc: ForbiddenException):
        """Handle ForbiddenException."""
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": exc.detail}
        )
    
    @app.exception_handler(BadRequestException)
    async def bad_request_exception_handler(request: Request, exc: BadRequestException):
        """Handle BadRequestException."""
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": exc.detail}
        )