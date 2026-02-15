"""
Green Matchers - Database Session Management
Handles database connection, session factory, and dependency injection.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from apps.backend.core.config import get_settings

settings = get_settings()

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False  # Set to True for SQL query logging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    Dependency function to get database session.
    
    Yields:
        Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    Call this to create all tables defined in models.
    """
    from .base import Base
    Base.metadata.create_all(bind=engine)
