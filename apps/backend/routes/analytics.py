"""
Green Matchers - Analytics Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, func
from typing import List
from core.deps import DatabaseSession, get_current_user, require_admin
from models.user import User, UserRole
from models.job import Job
from models.career import Career
from models.application import Application
from schemas.analytics import (
    CareerDemand,
    SkillPopularity,
    SalaryRange,
    SDGDistribution,
    AnalyticsOverview,
    CareerDemandQuery,
    SkillPopularityQuery,
    SalaryRangeQuery,
)

router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    current_user: dict = Depends(get_current_user),
    db: DatabaseSession = Depends()
):
    """
    Get analytics overview (admin only).
    """
    # Verify user is an admin
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    if user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view analytics"
        )
    
    # Calculate overview metrics
    total_users = db.query(func.count(User.id)).scalar()
    total_jobs = db.query(func.count(Job.id)).scalar()
    total_careers = db.query(func.count(Career.id)).scalar()
    total_applications = db.query(func.count(Application.id)).scalar()
    verified_companies = db.query(func.count(User.id)).filter(
        User.role == UserRole.EMPLOYER,
        User.is_verified == 1
    ).scalar()
    
    # Active jobs in last 30 days
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_jobs_last_30_days = db.query(func.count(Job.id)).filter(
        Job.created_at >= thirty_days_ago
    ).scalar()
    
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
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: DatabaseSession = Depends()
):
    """
    Get career demand analytics (admin only).
    """
    # Verify user is an admin
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    if user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view analytics"
        )
    
    # Calculate demand score for each career
    careers = db.query(Career).all()
    career_demand_list = []
    
    for career in careers:
        # Count applications for jobs in this career
        job_ids = [job.id for job in career.jobs]
        application_count = db.query(func.count(Application.id)).filter(
            Application.job_id.in_(job_ids)
        ).scalar()
        
        # Calculate demand score
        job_count = len(career.jobs)
        demand_score = (application_count / job_count * 100) if job_count > 0 else 0.0
        
        career_demand_list.append(CareerDemand(
            career_id=career.id,
            career_title=career.title,
            demand_score=demand_score,
            application_count=application_count,
            job_count=job_count
        ))
    
    # Sort by demand score and limit
    career_demand_list.sort(key=lambda x: x.demand_score, reverse=True)
    return career_demand_list[:limit]


@router.get("/skill-popularity", response_model=List[SkillPopularity])
def get_skill_popularity(
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db: DatabaseSession = Depends()
):
    """
    Get skill popularity analytics (admin only).
    """
    # Verify user is an admin
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    if user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view analytics"
        )
    
    # Count skill occurrences in user profiles
    skill_counts = {}
    users = db.query(User).filter(User.skills.isnot(None)).all()
    
    for user in users:
        if user.skills:
            for skill in user.skills:
                skill_counts[skill] = skill_counts.get(skill, 0) + 1
    
    # Convert to list and sort
    skill_popularity_list = [
        SkillPopularity(
            skill=skill,
            count=count,
            trend="stable"  # Simplified for now
        )
        for skill, count in sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return skill_popularity_list[:limit]


@router.get("/salary-ranges", response_model=List[SalaryRange])
def get_salary_ranges(
    career_id: int = None,
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db: DatabaseSession = Depends()
):
    """
    Get salary range analytics (admin only).
    """
    # Verify user is an admin
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    if user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view analytics"
        )
    
    # Get careers with salary data
    query = db.query(Career).filter(
        Career.avg_salary_min.isnot(None),
        Career.avg_salary_max.isnot(None)
    )
    
    if career_id:
        query = query.filter(Career.id == career_id)
    
    careers = query.limit(limit).all()
    
    # Calculate salary ranges
    salary_range_list = []
    for career in careers:
        job_count = len(career.jobs)
        avg_salary = (career.avg_salary_min + career.avg_salary_max) / 2 if career.avg_salary_min and career.avg_salary_max else 0
        
        salary_range_list.append(SalaryRange(
            career_id=career.id,
            career_title=career.title,
            min_salary=career.avg_salary_min or 0,
            max_salary=career.avg_salary_max or 0,
            avg_salary=avg_salary,
            job_count=job_count
        ))
    
    return salary_range_list


@router.get("/sdg-distribution", response_model=List[SDGDistribution])
def get_sdg_distribution(
    current_user: dict = Depends(get_current_user),
    db: DatabaseSession = Depends()
):
    """
    Get SDG goal distribution (admin only).
    """
    # Verify user is an admin
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    if user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view analytics"
        )
    
    # Count SDG tags in jobs
    sdg_counts = {}
    jobs = db.query(Job).filter(Job.sdg_tags.isnot(None)).all()
    total_jobs = len(jobs)
    
    for job in jobs:
        if job.sdg_tags:
            for sdg in job.sdg_tags:
                sdg_counts[sdg] = sdg_counts.get(sdg, 0) + 1
    
    # SDG goal names
    sdg_names = {
        1: "No Poverty",
        2: "Zero Hunger",
        3: "Good Health",
        4: "Quality Education",
        5: "Gender Equality",
        6: "Clean Water",
        7: "Clean Energy",
        8: "Decent Work",
        9: "Industry Innovation",
        10: "Reduced Inequalities",
        11: "Sustainable Cities",
        12: "Responsible Consumption",
        13: "Climate Action",
        14: "Life Below Water",
        15: "Life on Land",
        16: "Peace & Justice",
        17: "Partnerships"
    }
    
    # Convert to list
    sdg_distribution_list = [
        SDGDistribution(
            sdg_goal=sdg,
            sdg_name=sdg_names.get(sdg, f"SDG {sdg}"),
            count=count,
            percentage=(count / total_jobs * 100) if total_jobs > 0 else 0
        )
        for sdg, count in sorted(sdg_counts.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return sdg_distribution_list
