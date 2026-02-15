"""
Admin-Only Routes (Read-Only Oversight)
Admin users can view all jobs and applications for audit purposes.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from apps.backend.core.deps import DatabaseSession, get_current_user, require_role
from apps.backend.models.user import User, UserRole
from apps.backend.models.job import Job
from apps.backend.models.application import Application
from apps.backend.schemas.admin import AdminJobResponse, AdminApplicationResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/jobs", response_model=List[AdminJobResponse])
def list_all_jobs(
    db: DatabaseSession,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum records to return"),
    is_verified: Optional[bool] = None,
):
    """
    Admin view: List all jobs in the system.
    
    Returns job id, title, employer, status, verification, and creation date.
    """
    query = db.query(Job)
    
    if is_verified is not None:
        query = query.filter(Job.is_verified == is_verified)
    
    jobs = query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
    return jobs


@router.get("/applications", response_model=List[AdminApplicationResponse])
def list_all_applications(
    db: DatabaseSession,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum records to return"),
    days: Optional[int] = Query(None, description="Filter applications from last N days"),
):
    """
    Admin view: List all applications in the system.
    
    Returns application id, job id, candidate id, status, audit trail.
    No candidate or employer contact info exposed.
    """
    query = db.query(Application)
    
    if days is not None:
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        query = query.filter(Application.created_at >= cutoff_date)
    
    applications = query.order_by(Application.created_at.desc()).offset(skip).limit(limit).all()
    return applications


@router.get("/jobs/{job_id}/applications", response_model=List[AdminApplicationResponse])
def list_job_applications(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    """
    Admin view: List all applications for a specific job.
    
    Returns applications filtered by job, with audit trail.
    """
    applications = db.query(Application).filter(
        Application.job_id == job_id
    ).order_by(Application.created_at.desc()).all()
    return applications


@router.get("/stats")
def get_admin_stats(
    db: DatabaseSession,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
) -> Dict[str, Any]:
    """
    Admin view: Get system statistics.
    """
    total_jobs = db.query(Job).count()
    verified_jobs = db.query(Job).filter(Job.is_verified == True).count()
    total_applications = db.query(Application).count()
    total_users = db.query(User).count()
    
    # Applications in last 7 days
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_applications = db.query(Application).filter(
        Application.created_at >= seven_days_ago
    ).count()
    
    return {
        "total_jobs": total_jobs,
        "verified_jobs": verified_jobs,
        "unverified_jobs": total_jobs - verified_jobs,
        "total_applications": total_applications,
        "recent_applications_7d": recent_applications,
        "total_users": total_users,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }


@router.get("/users")
def list_all_users(
    db: DatabaseSession,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    role: Optional[UserRole] = None,
) -> List[Dict[str, Any]]:
    """
    Admin view: List all users in the system.
    """
    query = db.query(User)
    
    if role is not None:
        query = query.filter(User.role == role)
    
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role.value if hasattr(user.role, 'value') else user.role,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
        for user in users
    ]
