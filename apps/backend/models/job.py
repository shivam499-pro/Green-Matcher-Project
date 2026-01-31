"""
Green Matchers - Job Model
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from utils.db import Base


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
    
    # Salary information
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    
    # Location
    location = Column(String(255), nullable=True)
    
    # SDG (Sustainable Development Goals) tags
    sdg_tags = Column(JSON, nullable=True)  # Array of SDG goal numbers
    
    # Verification status
    is_verified = Column(Boolean, default=False)
    
    # Vector embedding for semantic search (768-dim from all-mpnet-base-v2)
    embedding = Column(String(5000), nullable=True)  # Store as JSON string for compatibility
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    employer = relationship("User", back_populates="posted_jobs")
    career = relationship("Career", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Job(id={self.id}, title={self.title}, employer_id={self.employer_id})>"
