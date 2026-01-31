"""
Green Matchers - Jobs Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from core.deps import DatabaseSession, get_current_user
from models.job import Job
from models.user import User
from schemas.job import JobCreate, JobUpdate, JobResponse, JobDetailResponse

router = APIRouter()


@router.get("", response_model=List[JobResponse])
def list_jobs(
    search: Optional[str] = None,
    career_id: Optional[int] = None,
    location: Optional[str] = None,
    salary_min: Optional[int] = None,
    salary_max: Optional[int] = None,
    sdg_tag: Optional[int] = None,
    verified_only: bool = False,
    skip: int = 0,
    limit: int = 20,
    db: DatabaseSession = Depends()
):
    """
    List jobs with optional filters.
    """
    query = db.query(Job)
    
    # Apply filters
    if search:
        query = query.filter(Job.title.contains(search) | Job.description.contains(search))
    if career_id:
        query = query.filter(Job.career_id == career_id)
    if location:
        query = query.filter(Job.location.contains(location))
    if salary_min:
        query = query.filter(Job.salary_min >= salary_min)
    if salary_max:
        query = query.filter(Job.salary_max <= salary_max)
    if sdg_tag:
        # Filter by SDG tag (stored as JSON)
        query = query.filter(Job.sdg_tags.contains([sdg_tag]))
    if verified_only:
        query = query.filter(Job.is_verified == True)
    
    # Order by creation date (newest first)
    query = query.order_by(Job.created_at.desc())
    
    # Apply pagination
    jobs = query.offset(skip).limit(limit).all()
    
    return jobs


@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job(job_id: int, db: DatabaseSession = Depends()):
    """
    Get job details by ID.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Get employer information
    employer = db.query(User).filter(User.id == job.employer_id).first()
    
    # Count applications
    application_count = len(job.applications)
    
    return JobDetailResponse(
        id=job.id,
        employer_id=job.employer_id,
        career_id=job.career_id,
        title=job.title,
        description=job.description,
        requirements=job.requirements,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        location=job.location,
        sdg_tags=job.sdg_tags,
        is_verified=job.is_verified,
        created_at=job.created_at,
        updated_at=job.updated_at,
        employer_name=employer.full_name if employer else None,
        company_name=employer.company_name if employer else None,
        company_description=employer.company_description if employer else None,
        company_website=employer.company_website if employer else None,
        is_company_verified=bool(employer.is_verified) if employer else False,
        application_count=application_count
    )


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_data: JobCreate,
    current_user: dict = Depends(get_current_user),
    db: DatabaseSession = Depends()
):
    """
    Create a new job posting (employer only).
    """
    # Verify user is an employer
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    if user.role.value != "EMPLOYER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can create job postings"
        )
    
    # Create new job
    new_job = Job(
        employer_id=user.id,
        career_id=job_data.career_id,
        title=job_data.title,
        description=job_data.description,
        requirements=job_data.requirements,
        salary_min=job_data.salary_min,
        salary_max=job_data.salary_max,
        location=job_data.location,
        sdg_tags=job_data.sdg_tags,
        is_verified=False  # Jobs need verification
    )
    
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    
    return new_job


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobUpdate,
    current_user: dict = Depends(get_current_user),
    db: DatabaseSession = Depends()
):
    """
    Update a job posting (employer only).
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Verify user owns this job
    if job.employer_id != int(current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own job postings"
        )
    
    # Update fields if provided
    if job_update.title is not None:
        job.title = job_update.title
    if job_update.description is not None:
        job.description = job_update.description
    if job_update.requirements is not None:
        job.requirements = job_update.requirements
    if job_update.salary_min is not None:
        job.salary_min = job_update.salary_min
    if job_update.salary_max is not None:
        job.salary_max = job_update.salary_max
    if job_update.location is not None:
        job.location = job_update.location
    if job_update.sdg_tags is not None:
        job.sdg_tags = job_update.sdg_tags
    # Only admins can update verification status
    if job_update.is_verified is not None and current_user["role"] == "ADMIN":
        job.is_verified = job_update.is_verified
    
    db.commit()
    db.refresh(job)
    
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    current_user: dict = Depends(get_current_user),
    db: DatabaseSession = Depends()
):
    """
    Delete a job posting (employer only).
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Verify user owns this job
    if job.employer_id != int(current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own job postings"
        )
    
    db.delete(job)
    db.commit()
    
    return None
