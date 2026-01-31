"""
Green Matchers - Career Schemas
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Base Career Schema
class CareerBase(BaseModel):
    """Base career schema with common fields."""
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    required_skills: List[str] = Field(..., min_length=1)
    sdg_tags: Optional[List[int]] = None
    avg_salary_min: Optional[int] = Field(None, ge=0)
    avg_salary_max: Optional[int] = Field(None, ge=0)


# Career Create Schema
class CareerCreate(CareerBase):
    """Schema for creating a new career."""
    pass


# Career Update Schema
class CareerUpdate(BaseModel):
    """Schema for updating a career."""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    required_skills: Optional[List[str]] = None
    sdg_tags: Optional[List[int]] = None
    avg_salary_min: Optional[int] = Field(None, ge=0)
    avg_salary_max: Optional[int] = Field(None, ge=0)
    demand_score: Optional[float] = None


# Career Response Schema
class CareerResponse(BaseModel):
    """Schema for career response."""
    id: int
    title: str
    description: str
    required_skills: List[str]
    sdg_tags: Optional[List[int]] = None
    avg_salary_min: Optional[int] = None
    avg_salary_max: Optional[int] = None
    demand_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Career Detail Response Schema (includes job count)
class CareerDetailResponse(CareerResponse):
    """Schema for detailed career response."""
    job_count: int = 0


# Career Recommendation Schema
class CareerRecommendation(BaseModel):
    """Schema for career recommendation with similarity score."""
    career: CareerResponse
    similarity_score: float
    match_reason: str


# Career List Query Parameters
class CareerQueryParams(BaseModel):
    """Schema for career list query parameters."""
    search: Optional[str] = None
    sdg_tag: Optional[int] = None
    skill: Optional[str] = None
    skip: int = 0
    limit: int = 20
