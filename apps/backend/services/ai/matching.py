"""
Matching Service
Handles skill → career matching using semantic similarity
"""

import logging
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass

from sqlalchemy.orm import Session

from models.career import Career
from models.user import User
from .embeddings import EmbeddingService

logger = logging.getLogger(__name__)


@dataclass
class CareerMatch:
    """Represents a career match with similarity score."""
    career: Career
    similarity_score: float
    matched_skills: List[str]
    missing_skills: List[str]


class MatchingService:
    """
    Service for matching user skills to career paths using semantic similarity.
    
    Uses cosine similarity between user skill embeddings and career embeddings
    to find the best matching careers.
    """
    
    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service
    
    def match_careers_for_user(
        self,
        db: Session,
        user: User,
        limit: int = 10,
        min_similarity: float = 0.3
    ) -> List[CareerMatch]:
        """
        Find matching careers for a user based on their skills.
        
        Args:
            db: Database session
            user: User object with skills
            limit: Maximum number of matches to return
            min_similarity: Minimum similarity threshold (0-1)
            
        Returns:
            List[CareerMatch]: List of career matches sorted by similarity
        """
        if not user.skills or len(user.skills) == 0:
            logger.warning(f"User {user.id} has no skills to match")
            return []
        
        # Get user skill embedding
        user_embedding = self.embedding_service.encode_user_skills(user.skills)
        
        # Get all careers
        careers = db.query(Career).filter(Career.is_active == True).all()
        
        if not careers:
            logger.warning("No active careers found in database")
            return []
        
        # Calculate similarities
        matches = []
        for career in careers:
            # Parse career embedding from JSON
            career_embedding = self.embedding_service.json_to_vector(career.embedding)
            
            # Calculate similarity
            similarity = self.embedding_service.cosine_similarity(
                user_embedding, 
                career_embedding
            )
            
            # Filter by minimum similarity
            if similarity >= min_similarity:
                # Find matched and missing skills
                matched, missing = self._compare_skills(
                    user.skills, 
                    career.required_skills
                )
                
                matches.append(CareerMatch(
                    career=career,
                    similarity_score=similarity,
                    matched_skills=matched,
                    missing_skills=missing
                ))
        
        # Sort by similarity (descending)
        matches.sort(key=lambda x: x.similarity_score, reverse=True)
        
        # Return top matches
        return matches[:limit]
    
    def match_careers_by_skills(
        self,
        db: Session,
        skills: List[str],
        limit: int = 10,
        min_similarity: float = 0.3
    ) -> List[CareerMatch]:
        """
        Find matching careers for a list of skills.
        
        Args:
            db: Database session
            skills: List of skills to match
            limit: Maximum number of matches to return
            min_similarity: Minimum similarity threshold (0-1)
            
        Returns:
            List[CareerMatch]: List of career matches sorted by similarity
        """
        if not skills:
            logger.warning("No skills provided for matching")
            return []
        
        # Get skill embedding
        skill_embedding = self.embedding_service.encode_user_skills(skills)
        
        # Get all careers
        careers = db.query(Career).filter(Career.is_active == True).all()
        
        if not careers:
            logger.warning("No active careers found in database")
            return []
        
        # Calculate similarities
        matches = []
        for career in careers:
            # Parse career embedding from JSON
            career_embedding = self.embedding_service.json_to_vector(career.embedding)
            
            # Calculate similarity
            similarity = self.embedding_service.cosine_similarity(
                skill_embedding, 
                career_embedding
            )
            
            # Filter by minimum similarity
            if similarity >= min_similarity:
                # Find matched and missing skills
                matched, missing = self._compare_skills(
                    skills, 
                    career.required_skills
                )
                
                matches.append(CareerMatch(
                    career=career,
                    similarity_score=similarity,
                    matched_skills=matched,
                    missing_skills=missing
                ))
        
        # Sort by similarity (descending)
        matches.sort(key=lambda x: x.similarity_score, reverse=True)
        
        # Return top matches
        return matches[:limit]
    
    def _compare_skills(
        self,
        user_skills: List[str],
        required_skills: List[str]
    ) -> Tuple[List[str], List[str]]:
        """
        Compare user skills with required skills.
        
        Args:
            user_skills: List of user's skills
            required_skills: List of required skills for a career
            
        Returns:
            Tuple[List[str], List[str]]: (matched_skills, missing_skills)
        """
        # Normalize skills to lowercase for comparison
        user_skills_lower = [s.lower().strip() for s in user_skills]
        required_skills_lower = [s.lower().strip() for s in required_skills]
        
        # Find matched skills
        matched = []
        for req_skill in required_skills_lower:
            for user_skill in user_skills_lower:
                # Check for exact match or partial match
                if req_skill == user_skill or req_skill in user_skill or user_skill in req_skill:
                    matched.append(req_skill)
                    break
        
        # Find missing skills
        missing = [s for s in required_skills_lower if s not in matched]
        
        return matched, missing
    
    def calculate_match_score(
        self,
        user_skills: List[str],
        required_skills: List[str],
        semantic_similarity: float
    ) -> float:
        """
        Calculate a combined match score considering both semantic similarity
        and skill overlap.
        
        Args:
            user_skills: List of user's skills
            required_skills: List of required skills
            semantic_similarity: Semantic similarity score (0-1)
            
        Returns:
            float: Combined match score (0-1)
        """
        if not required_skills:
            return semantic_similarity
        
        # Calculate skill overlap ratio
        matched, missing = self._compare_skills(user_skills, required_skills)
        skill_overlap = len(matched) / len(required_skills) if required_skills else 0
        
        # Weighted combination (70% semantic, 30% skill overlap)
        combined_score = 0.7 * semantic_similarity + 0.3 * skill_overlap
        
        return combined_score
    
    def get_career_recommendations(
        self,
        db: Session,
        user: User,
        limit: int = 5
    ) -> List[Dict]:
        """
        Get career recommendations for a user in a format suitable for API response.
        
        Args:
            db: Database session
            user: User object
            limit: Maximum number of recommendations
            
        Returns:
            List[Dict]: List of career recommendation dictionaries
        """
        matches = self.match_careers_for_user(db, user, limit=limit)
        
        recommendations = []
        for match in matches:
            recommendations.append({
                "career_id": match.career.id,
                "title": match.career.title,
                "description": match.career.description,
                "similarity_score": round(match.similarity_score, 3),
                "match_percentage": round(match.similarity_score * 100, 1),
                "matched_skills": match.matched_skills,
                "missing_skills": match.missing_skills,
                "required_skills": match.career.required_skills,
                "avg_salary_min": match.career.avg_salary_min,
                "avg_salary_max": match.career.avg_salary_max,
                "demand_score": match.career.demand_score,
                "sdg_tags": match.career.sdg_tags
            })
        
        return recommendations


# Singleton instance for dependency injection
matching_service = MatchingService(embedding_service=EmbeddingService())
