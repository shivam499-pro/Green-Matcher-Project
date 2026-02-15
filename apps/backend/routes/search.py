"""
Search Routes for Green Matchers
Advanced search functionality with filters, autocomplete, and full-text search
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy import or_

from apps.backend.core.deps import DatabaseSession, get_current_user
from apps.backend.models.job import Job
from apps.backend.models.career import Career
from apps.backend.models.user import User

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/jobs")
def search_jobs(
    db: DatabaseSession,
    q: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    salary_min: Optional[int] = None,
    salary_max: Optional[int] = None,
    skills: Optional[str] = None,
    experience_level: Optional[str] = None,
    remote: Optional[bool] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """
    Advanced job search with multiple filters.
    """
    query = db.query(Job).filter(Job.is_verified == True)
    
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            or_(Job.title.ilike(search_term), Job.description.ilike(search_term))
        )
    
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    
    if job_type:
        query = query.filter(Job.job_type == job_type)
    
    if salary_min:
        query = query.filter(Job.salary_min >= salary_min)
    if salary_max:
        query = query.filter(Job.salary_max <= salary_max)
    
    if skills:
        for skill in skills.split(","):
            query = query.filter(Job.required_skills.contains([skill.strip()]))
    
    if experience_level:
        query = query.filter(Job.experience_level == experience_level)
    
    if remote is not None:
        query = query.filter(Job.is_remote == remote)
    
    total = query.count()
    
    if sort_by == "salary":
        order_column = Job.salary_max
    else:
        order_column = Job.created_at
    
    if sort_order == "asc":
        query = query.order_by(order_column.asc())
    else:
        query = query.order_by(order_column.desc())
    
    jobs = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "jobs": jobs,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/careers")
def search_careers(
    db: DatabaseSession,
    q: Optional[str] = None,
    skills: Optional[str] = None,
    sort_by: Optional[str] = "demand_score",
    sort_order: Optional[str] = "desc",
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """
    Search careers with filters.
    """
    query = db.query(Career)
    
    if q:
        search_term = f"%{q}%"
        query = query.filter(or_(Career.title.ilike(search_term), Career.description.ilike(search_term)))
    
    if skills:
        for skill in skills.split(","):
            query = query.filter(Career.required_skills.contains([skill.strip()]))
    
    total = query.count()
    
    if sort_by == "demand_score":
        order_column = Career.demand_score
    else:
        order_column = Career.demand_score
    
    if sort_order == "asc":
        query = query.order_by(order_column.asc())
    else:
        query = query.order_by(order_column.desc())
    
    careers = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "careers": careers,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/autocomplete")
def search_autocomplete(
    q: str,
    db: DatabaseSession,
    type: Optional[str] = "jobs",
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """
    Autocomplete suggestions for search.
    """
    search_term = f"%{q}%"
    suggestions = []
    
    if type in ["jobs", "all"]:
        job_titles = db.query(Job.title).filter(
            Job.title.ilike(search_term), Job.is_verified == True
        ).distinct().limit(limit).all()
        suggestions.extend([{"type": "job", "value": title[0]} for title in job_titles])
    
    if type in ["careers", "all"]:
        career_titles = db.query(Career.title).filter(Career.title.ilike(search_term)).distinct().limit(limit).all()
        suggestions.extend([{"type": "career", "value": title[0]} for title in career_titles])
    
    return {"suggestions": suggestions[:limit]}


@router.get("/suggestions")
def get_search_suggestions(
    current_user: User = Depends(get_current_user)
):
    """
    Get search suggestions based on popular searches.
    """
    popular_searches = [
        {"type": "job", "value": "Software Engineer", "count": 150},
        {"type": "job", "value": "Data Scientist", "count": 120},
        {"type": "career", "value": "Sustainability Specialist", "count": 80}
    ]
    return {"popular_searches": popular_searches}
