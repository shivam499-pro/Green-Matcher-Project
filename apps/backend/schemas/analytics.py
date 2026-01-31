"""
Green Matchers - Analytics Schemas
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# Career Demand Schema
class CareerDemand(BaseModel):
    """Schema for career demand analytics."""
    career_id: int
    career_title: str
    demand_score: float
    application_count: int
    job_count: int


# Skill Popularity Schema
class SkillPopularity(BaseModel):
    """Schema for skill popularity analytics."""
    skill: str
    count: int
    trend: str  # "up", "down", "stable"


# Salary Range Schema
class SalaryRange(BaseModel):
    """Schema for salary range analytics."""
    career_id: int
    career_title: str
    min_salary: int
    max_salary: int
    avg_salary: float
    job_count: int


# SDG Distribution Schema
class SDGDistribution(BaseModel):
    """Schema for SDG goal distribution."""
    sdg_goal: int
    sdg_name: str
    count: int
    percentage: float


# Analytics Overview Schema
class AnalyticsOverview(BaseModel):
    """Schema for analytics overview."""
    total_users: int
    total_jobs: int
    total_careers: int
    total_applications: int
    verified_companies: int
    active_jobs_last_30_days: int


# Analytics Response Schema
class AnalyticsResponse(BaseModel):
    """Schema for analytics response."""
    metric_name: str
    data: Any
    computed_at: datetime

    class Config:
        from_attributes = True


# Career Demand Query Parameters
class CareerDemandQuery(BaseModel):
    """Schema for career demand query parameters."""
    limit: int = 10


# Skill Popularity Query Parameters
class SkillPopularityQuery(BaseModel):
    """Schema for skill popularity query parameters."""
    limit: int = 20


# Salary Range Query Parameters
class SalaryRangeQuery(BaseModel):
    """Schema for salary range query parameters."""
    career_id: Optional[int] = None
    limit: int = 20
