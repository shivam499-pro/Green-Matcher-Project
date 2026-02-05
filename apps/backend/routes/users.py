"""
Green Matchers - Users Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.deps import DatabaseSession, get_current_user
from models.user import User
from models.saved_job import SavedJob
from schemas.user import UserResponse, UserUpdate, EmployerProfileUpdate, SkillsUpdate, UserPublicProfile

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Get current user information.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Update current user profile.
    """
    # Update fields if provided
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.language is not None:
        current_user.language = user_update.language
    if user_update.skills is not None:
        current_user.skills = user_update.skills
    if user_update.resume_url is not None:
        current_user.resume_url = user_update.resume_url
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.put("/me/employer-profile", response_model=UserResponse)
def update_employer_profile(
    profile_update: EmployerProfileUpdate,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Update employer profile information.
    """
    if current_user.role.value != "EMPLOYER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can update employer profile"
        )
    
    # Update employer fields if provided
    if profile_update.company_name is not None:
        current_user.company_name = profile_update.company_name
    if profile_update.company_description is not None:
        current_user.company_description = profile_update.company_description
    if profile_update.company_website is not None:
        current_user.company_website = profile_update.company_website
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.put("/me/skills", response_model=UserResponse)
def update_user_skills(
    skills_update: SkillsUpdate,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Update user skills.
    """
    current_user.skills = skills_update.skills
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.get("/{user_id}", response_model=UserPublicProfile)
def get_user_by_id(
    user_id: int,
    db: DatabaseSession
):
    """
    Get user by ID (public profile).
    Returns limited user information - no sensitive data.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.post("/me/saved-jobs/{job_id}")
def save_job(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Save a job to user's saved jobs using proper join table.
    """
    # Check if already saved
    existing = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id,
        SavedJob.job_id == job_id
    ).first()
    
    if existing:
        return {"message": "Job already saved"}
    
    # Create new saved job entry
    saved_job = SavedJob(
        user_id=current_user.id,
        job_id=job_id
    )
    db.add(saved_job)
    db.commit()
    
    return {"message": "Job saved successfully"}


@router.delete("/me/saved-jobs/{job_id}")
def unsave_job(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Remove a job from user's saved jobs using proper join table.
    """
    # Delete the saved job entry
    deleted = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id,
        SavedJob.job_id == job_id
    ).delete()
    
    if deleted:
        db.commit()
        return {"message": "Job removed from saved jobs"}
    
    return {"message": "Job was not saved"}


@router.get("/me/saved-jobs")
def get_saved_jobs(
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Get user's saved jobs using proper join table.
    """
    from models.job import Job
    
    # Query saved jobs through join table
    saved_entries = db.query(SavedJob).filter(SavedJob.user_id == current_user.id).all()
    job_ids = [entry.job_id for entry in saved_entries]
    jobs = db.query(Job).filter(Job.id.in_(job_ids)).all()
    
    return {"items": jobs, "count": len(jobs)}


@router.get("/me/recommendations")
def get_career_recommendations(
    db: DatabaseSession,
    current_user: User = Depends(get_current_user),
    limit: int = 10
):
    """
    Get career recommendations for the current user based on their skills.
    """
    from services.ai.matching import matching_service
    from models.career import Career
    
    # Get career recommendations
    recommendations = matching_service.get_career_recommendations(db, current_user, limit=limit)
    
    # Format response to match frontend expectations
    formatted_recommendations = []
    for rec in recommendations:
        career = db.query(Career).filter(Career.id == rec["career_id"]).first()
        if career:
            formatted_recommendations.append({
                "career": {
                    "id": career.id,
                    "title": career.title,
                    "description": career.description,
                    "required_skills": career.required_skills,
                    "avg_salary_min": career.avg_salary_min,
                    "avg_salary_max": career.avg_salary_max,
                    "demand_score": career.demand_score,
                    "sdg_tags": career.sdg_tags
                },
                "similarity_score": rec["similarity_score"],
                "matched_skills": rec["matched_skills"],
                "missing_skills": rec["missing_skills"]
            })
    
    return {"recommendations": formatted_recommendations}


@router.get("/me/job-recommendations")
def get_job_recommendations(
    db: DatabaseSession,
    current_user: User = Depends(get_current_user),
    limit: int = 10
):
    """
    Get job recommendations for the current user based on their skills.
    """
    from services.ai.matching import matching_service
    from models.job import Job
    
    # Get job recommendations
    recommendations = matching_service.get_job_recommendations(db, current_user, limit=limit)
    
    # Format response to match frontend expectations
    formatted_recommendations = []
    for rec in recommendations:
        job = db.query(Job).filter(Job.id == rec["job_id"]).first()
        if job:
            formatted_recommendations.append({
                "job": {
                    "id": job.id,
                    "title": job.title,
                    "description": job.description,
                    "company_name": job.company_name,
                    "location": job.location,
                    "salary_min": job.salary_min,
                    "salary_max": job.salary_max,
                    "required_skills": job.required_skills,
                    "sdg_tags": job.sdg_tags
                },
                "similarity_score": rec["similarity_score"],
                "matched_skills": rec["matched_skills"],
                "missing_skills": rec["missing_skills"]
            })
    
    return {"recommendations": formatted_recommendations}
