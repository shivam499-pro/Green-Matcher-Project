"""
Green Matchers - Application Model
"""
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from apps.backend.db.base import Base
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
    
    # Audit fields (Phase 2.8 Step 3)
    decided_at = Column(DateTime, nullable=True)
    decided_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships with explicit foreign_keys to avoid ambiguity
    job = relationship("Job", back_populates="applications")
    
    applicant = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="applications"
    )
    
    # Employer who decided (set when application is accepted/rejected)
    decision_maker = relationship(
        "User",
        foreign_keys=[decided_by],
        overlaps="decisions_made"
    )

    def __repr__(self):
        return f"<Application(id={self.id}, job_id={self.job_id}, user_id={self.user_id}, status={self.status})>"
