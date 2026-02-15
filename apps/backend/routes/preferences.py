"""
Preferences Routes for Green Matchers
User preferences, saved jobs, job alerts, notifications, and browse history
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta

from apps.backend.core.deps import DatabaseSession, get_current_user
from apps.backend.models.job import Job
from apps.backend.models.user import User
from apps.backend.models.saved_job import SavedJob
from apps.backend.models.job_alert import JobAlert
from apps.backend.models.notification import Notification
from apps.backend.models.browse_history import BrowseHistory

router = APIRouter(prefix="/preferences", tags=["Preferences"])


@router.post("/saved-jobs/{job_id}")
async def save_job(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """Save a job for later."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    existing = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id, SavedJob.job_id == job_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Job already saved")
    
    saved_job = SavedJob(user_id=current_user.id, job_id=job_id, created_at=datetime.now(timezone.utc))
    db.add(saved_job)
    db.commit()
    return {"message": "Job saved successfully", "job_id": job_id}


@router.delete("/saved-jobs/{job_id}")
async def unsave_job(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """Remove a job from saved list."""
    saved_job = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id, SavedJob.job_id == job_id
    ).first()
    
    if not saved_job:
        raise HTTPException(status_code=404, detail="Saved job not found")
    
    db.delete(saved_job)
    db.commit()
    return {"message": "Job removed from saved list"}


@router.post("/saved-jobs/check/{job_id}")
async def check_job_saved(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """Check if a job is saved."""
    saved_job = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id, SavedJob.job_id == job_id
    ).first()
    return {"is_saved": saved_job is not None}


@router.get("/saved-jobs")
async def get_saved_jobs(
    db: DatabaseSession,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get all saved jobs."""
    saved_jobs = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id
    ).order_by(SavedJob.created_at.desc())
    
    total = saved_jobs.count()
    saved = saved_jobs.offset((page - 1) * limit).limit(limit).all()
    
    jobs: List[Dict[str, Any]] = []
    for item in saved:
        job = db.query(Job).filter(Job.id == item.job_id).first()
        if job:
            jobs.append({"job": job, "saved_at": item.created_at})
    
    return {"saved_jobs": jobs, "total": total, "page": page, "limit": limit}


@router.post("/job-alerts")
async def create_job_alert(
    alert_data: dict,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Create a new job alert."""
    # Calculate next trigger time based on frequency
    frequency = alert_data.get("frequency", "daily")
    next_trigger = datetime.now(timezone.utc) + timedelta(days=1) if frequency == "daily" else datetime.now(timezone.utc) + timedelta(weeks=1)
    
    job_alert = JobAlert(
        user_id=current_user.id,
        keywords=alert_data.get("keywords"),
        location=alert_data.get("location"),
        job_type=alert_data.get("job_type"),
        sdg_tags=alert_data.get("sdg_tags"),
        salary_min=alert_data.get("salary_min"),
        salary_max=alert_data.get("salary_max"),
        is_active=True,
        frequency=frequency,
        created_at=datetime.now(timezone.utc)
    )
    db.add(job_alert)
    db.commit()
    db.refresh(job_alert)
    return {"message": "Job alert created", "alert_id": job_alert.id, "next_trigger": next_trigger.isoformat()}


@router.get("/job-alerts")
async def get_job_alerts(
    db: DatabaseSession,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get all job alerts."""
    query = db.query(JobAlert).filter(JobAlert.user_id == current_user.id)
    
    if is_active is not None:
        query = query.filter(JobAlert.is_active == is_active)
    
    alerts = query.order_by(JobAlert.created_at.desc()).all()
    return {"alerts": alerts, "count": len(alerts)}


@router.delete("/job-alerts/{alert_id}")
async def delete_job_alert(
    alert_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """Delete a job alert."""
    alert = db.query(JobAlert).filter(
        JobAlert.id == alert_id, JobAlert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Job alert not found")
    
    db.delete(alert)
    db.commit()
    return {"message": "Job alert deleted"}


@router.post("/browse-history/{job_id}")
async def add_to_browse_history(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """Add a job to browse history."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    existing = db.query(BrowseHistory).filter(
        BrowseHistory.user_id == current_user.id, BrowseHistory.job_id == job_id
    ).first()
    
    if existing:
        db.delete(existing)
    
    history = BrowseHistory(user_id=current_user.id, job_id=job_id, viewed_at=datetime.now(timezone.utc))
    db.add(history)
    db.commit()
    return {"message": "Added to browse history"}


@router.get("/browse-history")
async def get_browse_history(
    db: DatabaseSession,
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """Get browse history."""
    history = db.query(BrowseHistory).filter(
        BrowseHistory.user_id == current_user.id
    ).order_by(BrowseHistory.viewed_at.desc()).limit(limit).all()
    
    jobs = []
    for item in history:
        job = db.query(Job).filter(Job.id == item.job_id).first()
        if job:
            jobs.append({"job": job, "viewed_at": item.viewed_at})
    
    return {"browse_history": jobs}


@router.delete("/browse-history")
async def clear_browse_history(
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """Clear all browse history."""
    db.query(BrowseHistory).filter(BrowseHistory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Browse history cleared"}


@router.get("/notifications")
async def get_notifications(
    db: DatabaseSession,
    unread_only: bool = False,
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """Get notifications."""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(Notification.created_at.desc())
    total = notifications.count()
    items = notifications.offset((page - 1) * limit).limit(limit).all()
    
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.is_read == False
    ).count()
    
    return {"notifications": items, "total": total, "unread_count": unread_count}


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}


@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """Delete a notification."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    return {"message": "Notification deleted"}


@router.get("/settings")
async def get_user_settings(current_user: User = Depends(get_current_user)):
    """Get user preferences and settings."""
    return {
        "email_notifications": current_user.email_notifications,
        "job_alerts": current_user.job_alerts,
        "application_updates": current_user.application_updates,
        "profile_visibility": current_user.profile_visibility,
        "language": current_user.language,
        "timezone": current_user.timezone,
        "theme": current_user.theme
    }


@router.put("/settings")
async def update_user_settings(
    settings: dict,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """Update user preferences and settings."""
    allowed_fields = [
        "email_notifications", "job_alerts", "application_updates",
        "profile_visibility", "language", "timezone", "theme"
    ]
    
    for key, value in settings.items():
        if key in allowed_fields and hasattr(current_user, key):
            setattr(current_user, key, value)
    
    db.commit()
    return {"message": "Settings updated successfully"}
