"""
Green Matchers - Application Model
"""
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from utils.db import Base
import enum


class ApplicationStatus(str, enum.Enum):
    """Application status options."""
    PENDING = "PENDING"
    REVIEWED = "REVIEWED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class Application(Base):
    """
    Application model representing job applications.
    """
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.PENDING)
    
    # Cover letter or additional notes
    cover_letter = Column(Text, nullable=True)
    
    # Timestamps
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="applications")
    applicant = relationship("User", back_populates="applications")

    def __repr__(self):
        return f"<Application(id={self.id}, job_id={self.job_id}, user_id={self.user_id}, status={self.status})>"
