"""
Application Service - Business Logic Layer
Handles application status transitions and lifecycle management.
"""

from datetime import datetime

from sqlalchemy.orm import Session

from apps.backend.models.application import Application, ApplicationStatus
from apps.backend.models.job import Job, JobStatus
from apps.backend.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    BadRequestException,
)


def _validate_employer_ownership(application: Application, employer_id: int):
    """Validate that the employer owns the job associated with the application."""
    if application.job.employer_id != employer_id:
        raise ForbiddenException("You do not own this job")


def _validate_pending(application: Application):
    """Validate that the application is in PENDING status."""
    if application.status != ApplicationStatus.PENDING:
        raise BadRequestException("Application decision already made")


def _validate_job_open(application: Application):
    """Validate that the job is OPEN for new hires."""
    if application.job.status != JobStatus.OPEN:
        raise BadRequestException("Job is not open for hiring")


def _check_no_accepted_application(db: Session, job_id: int, exclude_application_id: int = None):
    """Check that no other application for this job has been accepted."""
    query = db.query(Application).filter(
        Application.job_id == job_id,
        Application.status == ApplicationStatus.ACCEPTED
    )
    if exclude_application_id:
        query = query.filter(Application.id != exclude_application_id)
    
    existing = query.first()
    if existing:
        raise BadRequestException("This job already has an accepted candidate")


def accept_application(
    *,
    db: Session,
    application_id: int,
    employer_id: int,
) -> Application:
    """
    Accept a job application.
    
    Phase 2.8 Step 1: Auto-closes the job upon first acceptance.
    
    Args:
        db: Database session
        application_id: ID of the application to accept
        employer_id: ID of the employer making the decision
    
    Returns:
        The updated Application object
    
    Raises:
        NotFoundException: If application not found
        ForbiddenException: If employer doesn't own the job
        BadRequestException: If application decision already made or job not open
    """
    application = (
        db.query(Application)
        .join(Job)
        .filter(Application.id == application_id)
        .first()
    )

    if not application:
        raise NotFoundException("Application not found")

    _validate_employer_ownership(application, employer_id)
    _validate_pending(application)
    _validate_job_open(application)
    _check_no_accepted_application(db, application.job_id)

    # Accept the application and close the job atomically
    application.status = ApplicationStatus.ACCEPTED
    application.job.status = JobStatus.CLOSED
    
    # Phase 2.8 Step 3: Set audit trail
    application.decided_at = datetime.utcnow()
    application.decided_by = employer_id
    
    # Phase 2.8 Step 2: Auto-reject all remaining PENDING applications
    pending_applications = db.query(Application).filter(
        Application.job_id == application.job_id,
        Application.id != application.id,
        Application.status == ApplicationStatus.PENDING
    ).all()
    
    for pending_app in pending_applications:
        pending_app.status = ApplicationStatus.REJECTED
    
    db.commit()
    db.refresh(application)

    return application


def reject_application(
    *,
    db: Session,
    application_id: int,
    employer_id: int,
) -> Application:
    """
    Reject a job application.
    
    Args:
        db: Database session
        application_id: ID of the application to reject
        employer_id: ID of the employer making the decision
    
    Returns:
        The updated Application object
    
    Raises:
        NotFoundException: If application not found
        ForbiddenException: If employer doesn't own the job
        BadRequestException: If application decision already made
    """
    application = (
        db.query(Application)
        .join(Job)
        .filter(Application.id == application_id)
        .first()
    )

    if not application:
        raise NotFoundException("Application not found")

    _validate_employer_ownership(application, employer_id)
    _validate_pending(application)

    application.status = ApplicationStatus.REJECTED
    
    # Phase 2.8 Step 3: Set audit trail
    application.decided_at = datetime.utcnow()
    application.decided_by = employer_id
    
    db.commit()
    db.refresh(application)

    return application
