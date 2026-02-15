"""
Green Matchers - User Skill Model
Stores individual skills extracted from user resumes
"""
from sqlalchemy import Column, Integer, String, ForeignKey, Index
from sqlalchemy.orm import relationship
from apps.backend.db.base import Base


class UserSkill(Base):
    """
    UserSkill model for storing individual skills.
    Allows efficient skill-based queries and matching.
    """
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Skill information
    skill_name = Column(String(255), nullable=False, index=True)
    skill_category = Column(String(100), nullable=True)  # e.g., "Technical", "Soft Skills", "Domain"
    proficiency_level = Column(String(50), nullable=True)  # e.g., "Beginner", "Intermediate", "Expert"
    
    # Optional: years of experience with this skill
    years_experience = Column(Integer, nullable=True)

    # Relationships
    user = relationship("User", back_populates="user_skills_rel")

    # Indexes for efficient querying
    __table_args__ = (
        Index('idx_user_skill_name', 'user_id', 'skill_name'),
    )

    def __repr__(self):
        return f"<UserSkill(id={self.id}, user_id={self.user_id}, skill={self.skill_name})>"
