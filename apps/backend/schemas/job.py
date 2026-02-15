"""
Green Matchers - Job Schemas
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Base Job Schema
class JobBase(BaseModel):
    """Base job schema with common fields."""
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    requirements: Optional[str] = None
    salary_min: Optional[int] = Field(None, ge=0)
    salary_max: Optional[int] = Field(None, ge=0)
    location: Optional[str] = None
    sdg_tags: Optional[List[int]] = None


# Job Create Schema
class JobCreate(JobBase):
    """Schema for creating a new job."""
    career_id: Optional[int] = None


# Job Update Schema
class JobUpdate(BaseModel):
    """Schema for updating a job."""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    requirements: Optional[str] = None
    salary_min: Optional[int] = Field(None, ge=0)
    salary_max: Optional[int] = Field(None, ge=0)
    location: Optional[str] = None
    sdg_tags: Optional[List[int]] = None
    is_verified: Optional[bool] = None


# Job Response Schema
class JobResponse(BaseModel):
    """Schema for job response."""
    id: int
    employer_id: int
    career_id: Optional[int] = None
    title: str
    description: str
    requirements: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    location: Optional[str] = None
    sdg_tags: Optional[List[int]] = None
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Job Detail Response Schema (includes employer info)
class JobDetailResponse(JobResponse):
    """Schema for detailed job response with employer info."""
    employer_name: Optional[str] = None
    company_name: Optional[str] = None
    company_description: Optional[str] = None
    company_website: Optional[str] = None
    is_company_verified: bool
    application_count: int = 0


# Job List Query Parameters
class JobQueryParams(BaseModel):
    """Schema for job list query parameters."""
    search: Optional[str] = None
    career_id: Optional[int] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    sdg_tag: Optional[int] = None
    verified_only: bool = False
    skip: int = 0
    limit: int = 20
