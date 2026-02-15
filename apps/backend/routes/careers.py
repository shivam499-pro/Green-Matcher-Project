"""
Green Matchers - Careers Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from apps.backend.core.deps import DatabaseSession, get_current_user
from apps.backend.models.career import Career
from apps.backend.models.user import User
from apps.backend.schemas.career import CareerCreate, CareerUpdate, CareerResponse, CareerDetailResponse

router = APIRouter()


@router.get("", response_model=List[CareerResponse])
def list_careers(
    db: DatabaseSession,
    search: Optional[str] = None,
    sdg_tag: Optional[int] = None,
    skill: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
):
    """
    List careers with optional filters.
    """
    query = db.query(Career)
    
    # Apply filters
    if search:
        query = query.filter(Career.title.contains(search) | Career.description.contains(search))
    if sdg_tag:
        # Filter by SDG tag (stored as JSON)
        query = query.filter(Career.sdg_tags.contains([sdg_tag]))
    if skill:
        # Filter by skill (stored as JSON)
        query = query.filter(Career.required_skills.contains([skill]))
    
    # Order by demand score (highest first)
    query = query.order_by(Career.demand_score.desc())
    
    # Apply pagination
    careers = query.offset(skip).limit(limit).all()
    
    return careers


@router.get("/{career_id}", response_model=CareerDetailResponse)
def get_career(career_id: int, db: DatabaseSession):
    """
    Get career details by ID.
    """
    career = db.query(Career).filter(Career.id == career_id).first()
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found"
        )
    
    # Count jobs for this career
    job_count = len(career.jobs)
    
    return CareerDetailResponse(
        id=career.id,
        title=career.title,
        description=career.description,
        required_skills=career.required_skills,
        sdg_tags=career.sdg_tags,
        avg_salary_min=career.avg_salary_min,
        avg_salary_max=career.avg_salary_max,
        demand_score=career.demand_score,
        created_at=career.created_at,
        updated_at=career.updated_at,
        job_count=job_count
    )


@router.post("", response_model=CareerResponse, status_code=status.HTTP_201_CREATED)
def create_career(
    career_data: CareerCreate,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new career (admin only).
    """
    # Verify user is an admin
    if current_user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create careers"
        )
    
    # Create new career
    new_career = Career(
        title=career_data.title,
        description=career_data.description,
        required_skills=career_data.required_skills,
        sdg_tags=career_data.sdg_tags,
        avg_salary_min=career_data.avg_salary_min,
        avg_salary_max=career_data.avg_salary_max,
        demand_score=0.0
    )
    
    db.add(new_career)
    db.commit()
    db.refresh(new_career)
    
    return new_career


@router.put("/{career_id}", response_model=CareerResponse)
def update_career(
    career_id: int,
    career_update: CareerUpdate,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Update a career (admin only).
    """
    career = db.query(Career).filter(Career.id == career_id).first()
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found"
        )
    
    # Verify user is an admin
    if current_user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update careers"
        )
    
    # Update fields if provided
    if career_update.title is not None:
        career.title = career_update.title
    if career_update.description is not None:
        career.description = career_update.description
    if career_update.required_skills is not None:
        career.required_skills = career_update.required_skills
    if career_update.sdg_tags is not None:
        career.sdg_tags = career_update.sdg_tags
    if career_update.avg_salary_min is not None:
        career.avg_salary_min = career_update.avg_salary_min
    if career_update.avg_salary_max is not None:
        career.avg_salary_max = career_update.avg_salary_max
    if career_update.demand_score is not None:
        career.demand_score = career_update.demand_score
    
    db.commit()
    db.refresh(career)
    
    return career


@router.delete("/{career_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_career(
    career_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a career (admin only).
    """
    career = db.query(Career).filter(Career.id == career_id).first()
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career not found"
        )
    
    # Verify user is an admin
    if current_user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete careers"
        )
    
    db.delete(career)
    db.commit()
    
    return None
