"""
Job Alert Model for Green Matchers
"""
from sqlalchemy import Column, Integer, ForeignKey, String, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from apps.backend.db.base import Base
from datetime import datetime


class JobAlert(Base):
    __tablename__ = "job_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    keywords = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    job_type = Column(String(50), nullable=True)
    sdg_tags = Column(JSON, nullable=True)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    frequency = Column(String(50), default="daily")  # daily, weekly
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="job_alerts")
