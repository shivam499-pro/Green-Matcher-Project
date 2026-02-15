"""
Green Matchers - Job Model
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from apps.backend.db.base import Base
import enum


class JobStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"


class Job(Base):
    """
    Job model representing green job postings.
    Includes vector embedding for semantic search.
    """
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    career_id = Column(Integer, ForeignKey("careers.id"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    
    # Job type
    job_type = Column(String(50), nullable=True)  # full-time, part-time, contract, internship
    
    # Skills
    required_skills = Column(JSON, nullable=True)  # Array of required skills
    preferred_skills = Column(JSON, nullable=True)  # Array of preferred skills
    
    # Experience level
    experience_level = Column(String(50), nullable=True)  # entry, mid, senior, lead, executive
    
    # Salary information
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    
    # Location
    location = Column(String(255), nullable=True)
    is_remote = Column(Boolean, default=False)
    
    # SDG (Sustainable Development Goals) tags
    sdg_tags = Column(JSON, nullable=False, default=[])  # Array of SDG goal numbers
    
    # Active status
    is_active = Column(Boolean, default=True)
    
    # Job status
    status = Column(SQLEnum(JobStatus), nullable=False, default=JobStatus.DRAFT)
    
    # Verification status
    is_verified = Column(Boolean, default=False)
    
    # Vector embedding for semantic search (768-dim from all-mpnet-base-v2)
    # TODO: migrate to VECTOR / JSONB when DB supports native embeddings
    embedding = Column(String(5000), nullable=True)  # Store as JSON string for compatibility
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    employer = relationship("User", back_populates="posted_jobs")
    career = relationship("Career", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    saved_by = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")
    viewers = relationship("BrowseHistory", back_populates="job", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Job(id={self.id}, title={self.title}, employer_id={self.employer_id})>"
