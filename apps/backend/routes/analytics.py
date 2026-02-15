"""
Green Matchers - Analytics Routes
API endpoints for analytics and insights.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta, timezone

from apps.backend.core.deps import get_db, get_current_user
from apps.backend.models.analytics import Analytics
from apps.backend.models.job import Job
from apps.backend.models.career import Career
from apps.backend.models.application import Application
from apps.backend.models.user import User
from apps.backend.schemas.analytics import (
    CareerDemand,
    SkillPopularity,
    SalaryRange,
    SDGDistribution,
    AnalyticsOverview,
    AnalyticsResponse
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# SDG Goals mapping
SDG_GOALS = {
    1: "No Poverty",
    2: "Zero Hunger",
    3: "Good Health and Well-being",
    4: "Quality Education",
    5: "Gender Equality",
    6: "Clean Water and Sanitation",
    7: "Affordable and Clean Energy",
    8: "Decent Work and Economic Growth",
    9: "Industry, Innovation and Infrastructure",
    10: "Reduced Inequalities",
    11: "Sustainable Cities and Communities",
    12: "Responsible Consumption and Production",
    13: "Climate Action",
    14: "Life Below Water",
    15: "Life on Land",
    16: "Peace, Justice and Strong Institutions",
    17: "Partnerships for the Goals"
}


@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get analytics overview with key metrics.
    """
    # Total counts
    total_users = db.query(User).filter(User.role == "USER").count()
    total_jobs = db.query(Job).filter(Job.is_verified == True).count()
    total_careers = db.query(Career).count()
    total_applications = db.query(Application).count()
    
    # Verified companies (employers with verified jobs)
    verified_companies = db.query(Job.employer_id).filter(Job.is_verified == True).distinct().count()
    
    # Active jobs in last 30 days
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    active_jobs_last_30_days = db.query(Job).filter(
        Job.is_verified == True,
        Job.created_at >= thirty_days_ago
    ).count()
    
    return AnalyticsOverview(
        total_users=total_users,
        total_jobs=total_jobs,
        total_careers=total_careers,
        total_applications=total_applications,
        verified_companies=verified_companies,
        active_jobs_last_30_days=active_jobs_last_30_days
    )


@router.get("/career-demand", response_model=List[CareerDemand])
def get_career_demand(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get career demand analytics based on applications and job postings.
    Demand score = (application_count * 0.6) + (job_count * 0.4)
    """
    careers = db.query(Career).all()
    results = []
    
    for career in careers:
        # Count applications for this career
        application_count = db.query(Application).join(Job).filter(
            Job.career_id == career.id,
            Job.is_verified == True
        ).count()
        
        # Count jobs for this career
        job_count = db.query(Job).filter(
            Job.career_id == career.id,
            Job.is_verified == True
        ).count()
        
        # Calculate demand score (normalized to 0-100)
        max_apps = max(application_count, 1)
        max_jobs = max(job_count, 1)
        demand_score = min(100, (application_count / max_apps * 60) + (job_count / max_jobs * 40))
        
        results.append(CareerDemand(
            career_id=career.id,
            career_title=career.title,
            demand_score=round(demand_score, 2),
            application_count=application_count,
            job_count=job_count
        ))
    
    # Sort by demand score and limit
    results.sort(key=lambda x: x.demand_score, reverse=True)
    return results[:limit]


@router.get("/skill-popularity", response_model=List[SkillPopularity])
def get_skill_popularity(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get skill popularity analytics based on user profiles and job requirements.
    """
    # Extract skills from user profiles
    users = db.query(User).filter(User.role == "USER", User.skills.isnot(None)).all()
    skill_counts = {}
    
    for user in users:
        if user.skills:
            skills = user.skills if isinstance(user.skills, list) else user.skills.split(",")
            for skill in skills:
                skill = skill.strip().lower()
                if skill:
                    skill_counts[skill] = skill_counts.get(skill, 0) + 1
    
    # Convert to list and determine trends
    results = []
    for skill, count in skill_counts.items():
        # Simple trend logic (in real app, compare with historical data)
        trend = "stable"
        if count > 5:
            trend = "up"
        elif count < 2:
            trend = "down"
        
        results.append(SkillPopularity(
            skill=skill,
            count=count,
            trend=trend
        ))
    
    # Sort by count and limit
    results.sort(key=lambda x: x.count, reverse=True)
    return results[:limit]


@router.get("/salary-ranges", response_model=List[SalaryRange])
def get_salary_ranges(
    career_id: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get salary range analytics by career.
    """
    query = db.query(Job).filter(
        Job.is_verified == True,
        Job.salary_min.isnot(None),
        Job.salary_max.isnot(None)
    )
    
    if career_id:
        query = query.filter(Job.career_id == career_id)
    
    jobs = query.all()
    
    # Group by career
    career_salaries = {}
    for job in jobs:
        cid = job.career_id or 0
        if cid not in career_salaries:
            career_salaries[cid] = []
        career_salaries[cid].append((job.salary_min, job.salary_max))
    
    results = []
    for cid, salaries in career_salaries.items():
        # Calculate stats
        min_salary = min(s[0] for s in salaries)
        max_salary = max(s[1] for s in salaries)
        avg_salary = sum((s[0] + s[1]) / 2 for s in salaries) / len(salaries)
        
        # Get career title
        career = db.query(Career).filter(Career.id == cid).first()
        career_title = career.title if career else "Other"
        
        results.append(SalaryRange(
            career_id=cid,
            career_title=career_title,
            min_salary=min_salary,
            max_salary=max_salary,
            avg_salary=round(avg_salary, 2),
            job_count=len(salaries)
        ))
    
    # Sort by average salary and limit
    results.sort(key=lambda x: x.avg_salary, reverse=True)
    return results[:limit]


@router.get("/sdg-distribution", response_model=List[SDGDistribution])
def get_sdg_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get SDG goal distribution across all verified jobs.
    """
    jobs = db.query(Job).filter(
        Job.is_verified == True,
        Job.sdg_tags.isnot(None)
    ).all()
    sdg_counts = {}
    
    for job in jobs:
        if job.sdg_tags:
            tags = job.sdg_tags if isinstance(job.sdg_tags, list) else []
            for tag in tags:
                sdg_counts[tag] = sdg_counts.get(tag, 0) + 1
    
    total = sum(sdg_counts.values()) or 1
    results = []
    
    for sdg_num, count in sorted(sdg_counts.items()):
        results.append(SDGDistribution(
            sdg_goal=sdg_num,
            sdg_name=SDG_GOALS.get(sdg_num, f"SDG {sdg_num}"),
            count=count,
            percentage=round((count / total) * 100, 2)
        ))
    
    return results


@router.get("/metrics/{metric_name}", response_model=AnalyticsResponse)
def get_analytics_metric(
    metric_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific analytics metric by name.
    """
    metric = db.query(Analytics).filter(Analytics.metric_name == metric_name).first()
    
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    return AnalyticsResponse(
        metric_name=metric.metric_name,
        data=metric.metric_value,
        computed_at=metric.computed_at
    )


@router.post("/metrics/{metric_name}/recompute")
def recompute_analytics_metric(
    metric_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Recompute and store an analytics metric.
    """
    # Only allow admins to recompute
    if current_user.role.value != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can recompute metrics")
    
    # Compute the metric based on type
    data = None
    
    if metric_name == "career_demand":
        data = get_career_demand(limit=50, db=db, current_user=current_user)
    elif metric_name == "skill_popularity":
        data = get_skill_popularity(limit=100, db=db, current_user=current_user)
    elif metric_name == "salary_ranges":
        data = get_salary_ranges(limit=50, db=db, current_user=current_user)
    elif metric_name == "sdg_distribution":
        data = get_sdg_distribution(db=db, current_user=current_user)
    else:
        raise HTTPException(status_code=400, detail="Unknown metric name")
    
    # Store or update the metric
    existing = db.query(Analytics).filter(Analytics.metric_name == metric_name).first()
    
    if existing:
        existing.metric_value = [d.model_dump() for d in data] if hasattr(data, '__iter__') else data
        existing.computed_at = datetime.now(timezone.utc)
    else:
        new_metric = Analytics(
            metric_name=metric_name,
            metric_value=[d.model_dump() for d in data] if hasattr(data, '__iter__') else data
        )
        db.add(new_metric)
    
    db.commit()
    
    return {"message": f"Metric '{metric_name}' recomputed successfully"}
