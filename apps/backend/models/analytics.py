"""
Green Matchers - Analytics Model
"""
from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from utils.db import Base


class Analytics(Base):
    """
    Analytics model for storing computed metrics.
    """
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False, index=True)
    metric_value = Column(JSON, nullable=True)  # Flexible JSON storage for various metrics
    
    # Timestamps
    computed_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Analytics(id={self.id}, metric_name={self.metric_name})>"
