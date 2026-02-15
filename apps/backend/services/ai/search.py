"""
Search Service
Handles semantic job search using vector similarity
"""

import logging
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc

from apps.backend.models.job import Job
from apps.backend.models.career import Career
from .embeddings import EmbeddingService

logger = logging.getLogger(__name__)


@dataclass
class JobSearchResult:
    """Represents a job search result with similarity score."""
    job: Job
    similarity_score: float
    career_title: Optional[str] = None
    searched_at: datetime = None
    
    def __post_init__(self):
        if self.searched_at is None:
            self.searched_at = datetime.utcnow()


class SearchService:
    """
    Service for semantic job search using vector similarity.
    
    Uses cosine similarity between query embeddings and job embeddings
    to find the most relevant jobs.
    """
    
    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service
    
    def search_jobs(
        self,
        db: Session,
        query: str,
        limit: int = 20,
        min_similarity: float = 0.2,
        filters: Optional[Dict] = None
    ) -> List[JobSearchResult]:
        """
        Search for jobs using semantic similarity.
        
        Args:
            db: Database session
            query: Search query text
            limit: Maximum number of results
            min_similarity: Minimum similarity threshold (0-1)
            filters: Optional filters (location, salary_min, salary_max, sdg_tags)
            
        Returns:
            List[JobSearchResult]: List of job search results sorted by similarity
        """
        if not query or not query.strip():
            logger.warning("Empty search query provided")
            return []
        
        # Log search timestamp
        search_time = datetime.utcnow()
        logger.info(f"Starting job search at {search_time.isoformat()}")
        
        # Generate query embedding
        query_embedding = self.embedding_service.encode_text(query)
        
        # Build base query with ordering by creation date
        base_query = db.query(Job).filter(
            and_(
                Job.is_active == True,
                Job.is_verified == True
            )
        ).order_by(desc(Job.created_at))
        
        # Apply filters
        if filters:
            base_query = self._apply_filters(base_query, filters)
        
        # Get all matching jobs
        jobs = base_query.all()
        
        if not jobs:
            logger.warning("No jobs found matching filters")
            return []
        
        # Calculate similarities
        results = []
        for job in jobs:
            # Parse job embedding from JSON
            job_embedding = self.embedding_service.json_to_vector(job.embedding)
            
            # Calculate similarity
            similarity = self.embedding_service.cosine_similarity(
                query_embedding, 
                job_embedding
            )
            
            # Filter by minimum similarity
            if similarity >= min_similarity:
                # Get career title if available
                career_title = None
                if job.career:
                    career_title = job.career.title
                
                results.append(JobSearchResult(
                    job=job,
                    similarity_score=similarity,
                    career_title=career_title,
                    searched_at=search_time
                ))
        
        # Sort by similarity (descending)
        results.sort(key=lambda x: x.similarity_score, reverse=True)
        
        # Return top results
        return results[:limit]
    
    def search_jobs_by_skills(
        self,
        db: Session,
        skills: List[str],
        limit: int = 20,
        min_similarity: float = 0.2,
        filters: Optional[Dict] = None
    ) -> List[JobSearchResult]:
        """
        Search for jobs based on user skills.
        
        Args:
            db: Database session
            skills: List of user skills
            limit: Maximum number of results
            min_similarity: Minimum similarity threshold (0-1)
            filters: Optional filters
            
        Returns:
            List[JobSearchResult]: List of job search results
        """
        if not skills:
            logger.warning("No skills provided for search")
            return []
        
        # Log search timestamp
        search_time = datetime.utcnow()
        logger.info(f"Starting skill-based job search at {search_time.isoformat()}")
        
        # Generate skill embedding
        skill_embedding = self.embedding_service.encode_user_skills(skills)
        
        # Build base query with OR conditions for flexibility
        base_query = db.query(Job).filter(
            or_(
                Job.is_active == True,
                Job.is_verified == True
            )
        )
        
        # Apply filters
        if filters:
            base_query = self._apply_filters(base_query, filters)
        
        # Get all matching jobs
        jobs = base_query.all()
        
        if not jobs:
            logger.warning("No jobs found matching filters")
            return []
        
        # Calculate similarities
        results = []
        for job in jobs:
            # Parse job embedding from JSON
            job_embedding = self.embedding_service.json_to_vector(job.embedding)
            
            # Calculate similarity
            similarity = self.embedding_service.cosine_similarity(
                skill_embedding, 
                job_embedding
            )
            
            # Filter by minimum similarity
            if similarity >= min_similarity:
                # Get career title if available
                career_title = None
                if job.career:
                    career_title = job.career.title
                
                results.append(JobSearchResult(
                    job=job,
                    similarity_score=similarity,
                    career_title=career_title,
                    searched_at=search_time
                ))
        
        # Sort by similarity (descending)
        results.sort(key=lambda x: x.similarity_score, reverse=True)
        
        # Return top results
        return results[:limit]
    
    def search_careers(
        self,
        db: Session,
        query: str,
        limit: int = 10,
        min_similarity: float = 0.2
    ) -> List[Tuple[Career, float]]:
        """
        Search for careers using semantic similarity.
        
        Args:
            db: Database session
            query: Search query text
            limit: Maximum number of results
            min_similarity: Minimum similarity threshold (0-1)
            
        Returns:
            List[Tuple[Career, float]]: List of (career, similarity) tuples
        """
        if not query or not query.strip():
            logger.warning("Empty search query provided")
            return []
        
        # Log search timestamp
        search_time = datetime.utcnow()
        logger.info(f"Starting career search at {search_time.isoformat()}")
        
        # Generate query embedding
        query_embedding = self.embedding_service.encode_text(query)
        
        # Get all active careers
        careers = db.query(Career).filter(Career.is_active == True).all()
        
        if not careers:
            logger.warning("No active careers found")
            return []
        
        # Calculate similarities
        results = []
        for career in careers:
            # Parse career embedding from JSON
            career_embedding = self.embedding_service.json_to_vector(career.embedding)
            
            # Calculate similarity
            similarity = self.embedding_service.cosine_similarity(
                query_embedding, 
                career_embedding
            )
            
            # Filter by minimum similarity
            if similarity >= min_similarity:
                results.append((career, similarity))
        
        # Sort by similarity (descending)
        results.sort(key=lambda x: x[1], reverse=True)
        
        # Return top results
        return results[:limit]
    
    def _apply_filters(self, query, filters: Dict):
        """
        Apply filters to a job query.
        
        Args:
            query: SQLAlchemy query
            filters: Dictionary of filters
            
        Returns:
            Filtered SQLAlchemy query
        """
        # Location filter
        if "location" in filters and filters["location"]:
            query = query.filter(Job.location.ilike(f"%{filters['location']}%"))
        
        # Salary range filter
        if "salary_min" in filters and filters["salary_min"]:
            query = query.filter(Job.salary_max >= filters["salary_min"])
        
        if "salary_max" in filters and filters["salary_max"]:
            query = query.filter(Job.salary_min <= filters["salary_max"])
        
        # SDG tags filter
        if "sdg_tags" in filters and filters["sdg_tags"]:
            for sdg_tag in filters["sdg_tags"]:
                query = query.filter(Job.sdg_tags.contains(sdg_tag))
        
        # Career filter
        if "career_id" in filters and filters["career_id"]:
            query = query.filter(Job.career_id == filters["career_id"])
        
        # Employer filter
        if "employer_id" in filters and filters["employer_id"]:
            query = query.filter(Job.employer_id == filters["employer_id"])
        
        return query
    
    def get_similar_jobs(
        self,
        db: Session,
        job_id: int,
        limit: int = 5,
        min_similarity: float = 0.3
    ) -> List[JobSearchResult]:
        """
        Find jobs similar to a given job.
        
        Args:
            db: Database session
            job_id: ID of the reference job
            limit: Maximum number of results
            min_similarity: Minimum similarity threshold (0-1)
            
        Returns:
            List[JobSearchResult]: List of similar jobs
        """
        # Log search timestamp
        search_time = datetime.utcnow()
        
        # Get the reference job
        reference_job = db.query(Job).filter(Job.id == job_id).first()
        
        if not reference_job:
            logger.warning(f"Job {job_id} not found")
            return []
        
        # Parse reference job embedding
        reference_embedding = self.embedding_service.json_to_vector(reference_job.embedding)
        
        # Get all other active jobs using AND conditions
        jobs = db.query(Job).filter(
            and_(
                Job.id != job_id,
                Job.is_active == True,
                Job.is_verified == True
            )
        ).all()
        
        if not jobs:
            logger.warning("No other jobs found")
            return []
        
        # Calculate similarities
        results = []
        for job in jobs:
            # Parse job embedding from JSON
            job_embedding = self.embedding_service.json_to_vector(job.embedding)
            
            # Calculate similarity
            similarity = self.embedding_service.cosine_similarity(
                reference_embedding, 
                job_embedding
            )
            
            # Filter by minimum similarity
            if similarity >= min_similarity:
                # Get career title if available
                career_title = None
                if job.career:
                    career_title = job.career.title
                
                results.append(JobSearchResult(
                    job=job,
                    similarity_score=similarity,
                    career_title=career_title,
                    searched_at=search_time
                ))
        
        # Sort by similarity (descending)
        results.sort(key=lambda x: x.similarity_score, reverse=True)
        
        # Return top results
        return results[:limit]
    
    def format_search_results(self, results: List[JobSearchResult]) -> List[Dict]:
        """
        Format search results for API response.
        
        Args:
            results: List of JobSearchResult objects
            
        Returns:
            List[Dict]: Formatted search results
        """
        formatted = []
        for result in results:
            job = result.job
            formatted.append({
                "job_id": job.id,
                "title": job.title,
                "description": job.description,
                "requirements": job.requirements,
                "location": job.location,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "similarity_score": round(result.similarity_score, 3),
                "match_percentage": round(result.similarity_score * 100, 1),
                "career_title": result.career_title,
                "career_id": job.career_id,
                "employer_id": job.employer_id,
                "employer_name": job.employer.company_name if job.employer else None,
                "sdg_tags": job.sdg_tags,
                "created_at": job.created_at.isoformat() if job.created_at else None,
                "searched_at": result.searched_at.isoformat() if result.searched_at else None
            })
        
        return formatted


# Singleton instance for dependency injection
search_service = SearchService(embedding_service=EmbeddingService())
