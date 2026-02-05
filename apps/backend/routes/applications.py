"""
Green Matchers - Applications Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from core.deps import DatabaseSession, get_current_user
from models.application import Application
from models.job import Job
from models.user import User
from schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse, ApplicationDetailResponse

router = APIRouter()



@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    db: DatabaseSession,
    job_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """
    List applications for current user or employer's jobs.
    """
    query = db.query(Application)
    
    # Filter based on user role
    if current_user.role.value == "EMPLOYER":
        # Employers see applications for their jobs
        job_ids = [job.id for job in current_user.posted_jobs]
        query = query.filter(Application.job_id.in_(job_ids))
    else:
        # Job seekers see their own applications
        query = query.filter(Application.user_id == current_user.id)
    
    # Apply additional filters
    if job_id:
        query = query.filter(Application.job_id == job_id)
    if status_filter:
        query = query.filter(Application.status == status_filter)
    
    # Order by application date (newest first)
    query = query.order_by(Application.applied_at.desc())
    
    # Apply pagination
    applications = query.offset(skip).limit(limit).all()
    
    return applications


@router.get("/{application_id}", response_model=ApplicationDetailResponse)
def get_application(
    db: DatabaseSession,
    application_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Get application details by ID.
    """
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Verify user has access to this application
    if current_user.role.value == "EMPLOYER":
        # Employers can only see applications for their jobs
        job = db.query(Job).filter(Job.id == application.job_id).first()
        if job.employer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif application.user_id != current_user.id:
        # Job seekers can only see their own applications
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get related data
    job = db.query(Job).filter(Job.id == application.job_id).first()
    employer = db.query(User).filter(User.id == job.employer_id).first()
    applicant = db.query(User).filter(User.id == application.user_id).first()
    
    return ApplicationDetailResponse(
        id=application.id,
        job_id=application.job_id,
        user_id=application.user_id,
        status=application.status,
        cover_letter=application.cover_letter,
        applied_at=application.applied_at,
        updated_at=application.updated_at,
        job_title=job.title,
        job_description=job.description,
        job_salary_min=job.salary_min,
        job_salary_max=job.salary_max,
        job_location=job.location,
        employer_name=employer.full_name if employer else None,
        company_name=employer.company_name if employer else None,
        applicant_name=applicant.full_name if applicant else None,
        applicant_email=applicant.email if applicant else None,
        applicant_skills=applicant.skills if applicant else None,
        applicant_resume_url=applicant.resume_url if applicant else None
    )


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    application_data: ApplicationCreate,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Apply to a job (job seeker only).
    """
    # Verify user is a job seeker
    if current_user.role.value != "USER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only job seekers can apply to jobs"
        )
    
    # Check if job exists
    job = db.query(Job).filter(Job.id == application_data.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if user already applied to this job
    existing_application = db.query(Application).filter(
        Application.job_id == application_data.job_id,
        Application.user_id == current_user.id
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )
    
    # Create new application
    new_application = Application(
        job_id=application_data.job_id,
        user_id=current_user.id,
        cover_letter=application_data.cover_letter,
        status="PENDING"
    )
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    
    return new_application


@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    application_update: ApplicationUpdate,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Update application status (employer only).
    """
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Verify user is the employer who posted the job
    job = db.query(Job).filter(Job.id == application.job_id).first()
    
    if job.employer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update applications for your own jobs"
        )
    
    # Update status
    application.status = application_update.status
    db.commit()
    db.refresh(application)
    
    return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Delete an application (job seeker only, can only delete own applications).
    """
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Verify user owns this application
    if application.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own applications"
        )
    
    db.delete(application)
    db.commit()
    
    return None
