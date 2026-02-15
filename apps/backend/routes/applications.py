"""
Green Matchers - Applications Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from apps.backend.core.deps import DatabaseSession, get_current_user, require_role
from apps.backend.models.application import Application, ApplicationStatus
from apps.backend.models.job import Job, JobStatus
from apps.backend.models.user import User, UserRole
from apps.backend.schemas.application import (
    ApplicationCreate,
    ApplicationStatusUpdate,
    ApplicationResponse,
    ApplicationDetailResponse,
    ApplicationForEmployerResponse,
    ApplicationEmployerResponse,
    ApplicationEmployerAcceptedResponse,
    ApplicationUserResponse,
)
from apps.backend.services.application_service import (
    accept_application,
    reject_application,
)

router = APIRouter()


# Phase 2.7 Step 4.1 - Job Seeker: View My Applications
# =====================================================


@router.get(
    "/me",
    response_model=list[ApplicationUserResponse]
)
def get_my_applications(
    db: DatabaseSession,
    current_user: User = Depends(require_role(UserRole.USER)),
):
    """
    Job seeker views their own applications.
    
    Returns ApplicationUserResponse with no employer contact info.
    """
    
    applications = (
        db.query(Application)
        .join(Job)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.created_at.desc())
        .all()
    )

    return applications


@router.get(
    "/employer",
    response_model=List[ApplicationForEmployerResponse],
)
def list_applications_for_employer(
    db: Session = Depends(DatabaseSession),
    current_user: User = Depends(get_current_user),
    status: Optional[str] = None,
    job_id: Optional[int] = None,
):
    """
    Employer views applications for their jobs.
    Uses secure JOIN query to verify job ownership at DB level.
    """
    # 🔒 Role check
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(
            status_code=403,
            detail="Only employers can view applications",
        )

    # 🔍 Secure join query
    query = (
        db.query(Application)
        .join(Job, Application.job_id == Job.id)
        .filter(Job.employer_id == current_user.id)
    )

    if status:
        query = query.filter(Application.status == status)

    if job_id:
        query = query.filter(Application.job_id == job_id)

    applications = query.all()
    return applications


# Phase 2.7 Step 4.2 - Employer: Applications for My Job
# ===================================================


@router.get(
    "/jobs/{job_id}/applications",
)
def get_job_applications(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(require_role(UserRole.EMPLOYER)),
):
    """
    Employer views applications for a specific job.
    
    Response schema depends on status:
    - PENDING / REJECTED → ApplicationEmployerResponse (no contact info)
    - ACCEPTED → ApplicationEmployerAcceptedResponse (includes contact info)
    
    Manual schema mapping ensures no data leakage.
    """
    
    # Verify employer owns the job
    job = db.query(Job).filter(Job.id == job_id, Job.employer_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")
    
    # Fetch applications for this job
    applications = db.query(Application).filter(Application.job_id == job_id).all()
    
    # Manual schema mapping - no Union, no leakage
    result = []
    for app in applications:
        if app.status == ApplicationStatus.ACCEPTED:
            # Include contact info for accepted applications
            result.append(ApplicationEmployerAcceptedResponse(
                id=app.id,
                job_id=app.job_id,
                candidate_id=app.user_id,
                candidate_name=app.applicant.full_name if app.applicant else "",
                candidate_skills=app.applicant.skills if app.applicant else None,
                status=app.status,
                created_at=app.created_at,
                candidate_email=app.applicant.email if app.applicant else "",
                candidate_phone=app.applicant.phone if app.applicant else None,
            ))
        else:
            # No contact info for PENDING/REJECTED
            result.append(ApplicationEmployerResponse(
                id=app.id,
                job_id=app.job_id,
                candidate_id=app.user_id,
                candidate_name=app.applicant.full_name if app.applicant else "",
                candidate_skills=app.applicant.skills if app.applicant else None,
                status=app.status,
                created_at=app.created_at,
            ))
    
    return result


@router.put("/{application_id}/status", response_model=ApplicationForEmployerResponse)
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    db: Session = Depends(DatabaseSession),
    current_user: User = Depends(get_current_user),
):
    """
    Employer updates application status for their jobs.
    """
    # 🔒 Role check
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(403, "Only employers can update application status")

    # 🔍 Fetch application + job ownership (JOIN query)
    application = (
        db.query(Application)
        .join(Job, Application.job_id == Job.id)
        .filter(
            Application.id == application_id,
            Job.employer_id == current_user.id
        )
        .first()
    )

    if not application:
        raise HTTPException(404, "Application not found")

    # 🛑 Optional: block final states
    if application.status in (
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED
    ):
        raise HTTPException(400, "Finalized applications cannot be updated")

    # 🔁 Status transition
    application.status = data.status
    db.commit()
    db.refresh(application)

    return application


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
    if current_user.role == UserRole.EMPLOYER:
        # Employers see applications for their jobs via JOIN
        query = query.join(Job, Application.job_id == Job.id).filter(
            Job.employer_id == current_user.id
        )
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
    if current_user.role == UserRole.EMPLOYER:
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
    if current_user.role != UserRole.USER:
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
    
    # 🔒 Only verified jobs can be applied to
    if not job.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot apply to an unverified job"
        )
    
    # 🔒 Only OPEN jobs accept applications
    if job.status != JobStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Applications are only allowed for OPEN jobs"
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


# Phase 2.7 Step 3 - Employer Decision Endpoints
# =============================================
# These endpoints enforce RBAC and delegate business logic to the service layer.
# Schema selection ensures contact info is only exposed for ACCEPTED applications.


@router.post(
    "/{application_id}/accept",
    response_model=ApplicationEmployerAcceptedResponse,
)
def accept_application_endpoint(
    application_id: int,
    db: DatabaseSession,
    current_user: User = Depends(require_role(UserRole.EMPLOYER)),
):
    """
    Employer accepts a job application.
    
    Returns ApplicationEmployerAcceptedResponse with candidate contact info.
    """

    return accept_application(
        db=db,
        application_id=application_id,
        employer_id=current_user.id,
    )


@router.post(
    "/{application_id}/reject",
    response_model=ApplicationEmployerResponse,
)
def reject_application_endpoint(
    application_id: int,
    db: DatabaseSession,
    current_user: User = Depends(require_role(UserRole.EMPLOYER)),
):
    """
    Employer rejects a job application.
    
    Returns ApplicationEmployerResponse without candidate contact info.
    """

    return reject_application(
        db=db,
        application_id=application_id,
        employer_id=current_user.id,
    )
