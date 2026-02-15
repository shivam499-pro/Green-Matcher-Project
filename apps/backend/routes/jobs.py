"""
Green Matchers - Jobs Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from apps.backend.core.deps import DatabaseSession, get_current_user
from apps.backend.models.job import Job, JobStatus
from apps.backend.models.user import User, UserRole
from apps.backend.models.application import Application
from apps.backend.schemas.job import JobCreate, JobUpdate, JobResponse, JobDetailResponse
router = APIRouter()


@router.get("", response_model=List[JobResponse])
def list_jobs(
    db: DatabaseSession,
    search: Optional[str] = None,
    career_id: Optional[int] = None,
    location: Optional[str] = None,
    salary_min: Optional[int] = None,
    salary_max: Optional[int] = None,
    sdg_tag: Optional[int] = None,
    skip: int = 0,
    limit: int = 20
):
    """
    List verified jobs with optional filters.
    Only OPEN jobs are shown publicly.
    """
    query = db.query(Job)
    
    # 🔒 CRITICAL: Only show verified and OPEN jobs publicly
    query = query.filter(Job.is_verified == True, Job.status == JobStatus.OPEN)
    
    # Apply filters
    if search:
        query = query.filter(Job.title.ilike(f"%{search}%") | Job.description.ilike(f"%{search}%"))
    if career_id:
        query = query.filter(Job.career_id == career_id)
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if salary_min:
        query = query.filter(Job.salary_min >= salary_min)
    if salary_max:
        query = query.filter(Job.salary_max <= salary_max)
    if sdg_tag:
        # Filter by SDG tag (stored as ARRAY)
        query = query.filter(Job.sdg_tags.any(sdg_tag))
    
    # Order by creation date (newest first)
    query = query.order_by(Job.created_at.desc())
    
    # Apply pagination
    jobs = query.offset(skip).limit(limit).all()
    
    return jobs


@router.get("/my", response_model=List[JobResponse])
def get_my_jobs(
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Get jobs created by the logged-in employer.
    """
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can view their jobs"
        )

    return db.query(Job).filter(
        Job.employer_id == current_user.id
    ).all()


@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job(job_id: int, db: DatabaseSession):
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
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new job posting (employer only).
    """
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can create job postings"
        )

    try:
        new_job = Job(
            employer_id=current_user.id,
            career_id=job_data.career_id,
            title=job_data.title,
            description=job_data.description,
            requirements=job_data.requirements,
            salary_min=job_data.salary_min,
            salary_max=job_data.salary_max,
            location=job_data.location,
            sdg_tags=job_data.sdg_tags,
            is_verified=False
        )

        db.add(new_job)
        db.commit()
        db.refresh(new_job)

        return new_job

    except Exception as e:
        db.rollback()
        print("JOB CREATE ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to create job"
        )


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_data: JobUpdate,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user),
):
    """
    Update a job posting (employer only).
    """
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Only employers can update jobs")

    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 🔐 Ownership check
    if job.employer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this job")

    # 🔒 Edit hardening: Only DRAFT or OPEN jobs with no applications can be edited
    application_count = db.query(Application).filter(Application.job_id == job_id).count()
    
    allow_edit = False
    if job.status == JobStatus.DRAFT:
        allow_edit = True
    elif job.status == JobStatus.OPEN and application_count == 0:
        allow_edit = True
    
    if not allow_edit:
        raise HTTPException(
            status_code=403,
            detail="Jobs with applications cannot be edited. Close the job first."
        )

    # Update fields dynamically
    for field, value in job_data.dict(exclude_unset=True).items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user),
):
    """
    Delete a job posting (employer only).
    """
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Only employers can delete jobs")

    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.employer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this job")

    if job.is_verified:
        raise HTTPException(status_code=400, detail="Verified jobs cannot be deleted")

    db.delete(job)
    db.commit()


@router.put("/{job_id}/verify", response_model=JobResponse)
def verify_job(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user),
):
    """
    Admin verifies a job posting.
    """
    # 🔐 Admin-only
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can verify jobs"
        )

    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    job.is_verified = True
    db.commit()
    db.refresh(job)

    return job


@router.get("/admin/pending", response_model=List[JobResponse])
def list_pending_jobs(
    db: DatabaseSession,
    current_user: User = Depends(get_current_user),
):
    """
    Admin lists all pending (unverified) jobs.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins only"
        )

    return db.query(Job).filter(Job.is_verified == False).all()


@router.put("/{job_id}/publish", response_model=JobResponse)
def publish_job(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Employer publishes a DRAFT job (makes it OPEN for applications).
    """
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Not authorized")

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.employer_id == current_user.id
        )
        .first()
    )

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != JobStatus.DRAFT:
        raise HTTPException(
            status_code=400,
            detail="Only DRAFT jobs can be published"
        )

    job.status = JobStatus.OPEN
    db.commit()
    db.refresh(job)

    return job


@router.put("/{job_id}/close", response_model=JobResponse)
def close_job(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Employer closes an OPEN job (stops accepting applications).
    """
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Not authorized")

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.employer_id == current_user.id
        )
        .first()
    )

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != JobStatus.OPEN:
        raise HTTPException(
            status_code=400,
            detail="Only OPEN jobs can be closed"
        )

    job.status = JobStatus.CLOSED
    db.commit()
    db.refresh(job)

    return job


@router.put("/{job_id}/archive", response_model=JobResponse)
def archive_job(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Employer archives a CLOSED job.
    """
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail="Not authorized")

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.employer_id == current_user.id
        )
        .first()
    )

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != JobStatus.CLOSED:
        raise HTTPException(
            status_code=400,
            detail="Only CLOSED jobs can be archived"
        )

    job.status = JobStatus.ARCHIVED
    db.commit()
    db.refresh(job)

    return job
