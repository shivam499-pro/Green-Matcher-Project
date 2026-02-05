"""
Green Matchers - Career Model
"""
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from utils.db import Base


class Career(Base):
    """
    Career model representing green career paths.
    Includes vector embedding for semantic matching.
    """
    __tablename__ = "careers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, nullable=False)  # Array of skill strings
    
    # SDG (Sustainable Development Goals) tags
    sdg_tags = Column(JSON, nullable=True)  # Array of SDG goal numbers [7, 8, 13]
    
    # Salary information
    avg_salary_min = Column(Integer, nullable=True)
    avg_salary_max = Column(Integer, nullable=True)
    avg_salary = Column(Integer, nullable=True)
    
    # Growth potential
    growth_potential = Column(String(50), default="Medium")  # Low, Medium, High, Very High
    
    # Demand score (calculated from job applications)
    demand_score = Column(Float, default=0.0)
    
    # Vector embedding for semantic search (768-dim from all-mpnet-base-v2)
    # Note: MariaDB 10.11+ supports VECTOR type
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
    jobs = relationship("Job", back_populates="career", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Career(id={self.id}, title={self.title})>"
