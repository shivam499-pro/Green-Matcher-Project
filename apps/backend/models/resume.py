"""
Green Matchers - Resume Model
Stores user resume data with extracted skills and vector embeddings
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, LargeBinary
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from apps.backend.db.base import Base


class Resume(Base):
    """
    Resume model for storing parsed resume data.
    Includes vector embedding for semantic search.
    """
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Parsed resume content
    summary_text = Column(Text, nullable=True)
    skills_json = Column(JSON, nullable=True)  # List of extracted skills
    experience_json = Column(JSON, nullable=True)  # Work experience entries
    education_json = Column(JSON, nullable=True)  # Education entries
    certifications_json = Column(JSON, nullable=True)  # Certifications
    
    # Vector embedding for semantic search (768-dim from all-mpnet-base-v2)
    embedding = Column(LargeBinary, nullable=True)  # Binary storage for vector
    
    # Original file info
    file_url = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="resumes")

    def __repr__(self):
        return f"<Resume(id={self.id}, user_id={self.user_id})>"
