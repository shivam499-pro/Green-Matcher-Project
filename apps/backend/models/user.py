"""
Green Matchers - User Model
"""
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from utils.db import Base
import enum


class UserRole(str, enum.Enum):
    """User roles in the system."""
    USER = "USER"
    EMPLOYER = "EMPLOYER"
    ADMIN = "ADMIN"


class User(Base):
    """
    User model representing all user types (job seekers, employers, admins).
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.USER)
    
    # Job seeker specific fields
    skills = Column(JSON, nullable=True)  # Array of skill strings
    resume_url = Column(String(500), nullable=True)
    language = Column(String(10), default="en")  # Preferred language
    
    # Employer specific fields
    company_name = Column(String(255), nullable=True)
    company_description = Column(String(1000), nullable=True)
    company_website = Column(String(500), nullable=True)
    is_verified = Column(Integer, default=0)  # 0 = not verified, 1 = verified
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    posted_jobs = relationship("Job", back_populates="employer", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="applicant", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
