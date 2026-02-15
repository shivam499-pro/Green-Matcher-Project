"""
Browse History Model for Green Matchers
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from apps.backend.db.base import Base
from datetime import datetime


class BrowseHistory(Base):
    __tablename__ = "browse_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    viewed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="browse_history")
    job = relationship("Job", back_populates="viewers")
