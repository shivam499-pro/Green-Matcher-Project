"""
Green Matchers - Application Schemas
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from models.application import ApplicationStatus


# Base Application Schema
class ApplicationBase(BaseModel):
    """Base application schema with common fields."""
    cover_letter: Optional[str] = Field(None, max_length=2000)


# Application Create Schema
class ApplicationCreate(ApplicationBase):
    """Schema for creating a new application."""
    job_id: int


# Application Update Schema
class ApplicationUpdate(BaseModel):
    """Schema for updating an application (for employers)."""
    status: ApplicationStatus


# Application Response Schema
class ApplicationResponse(BaseModel):
    """Schema for application response."""
    id: int
    job_id: int
    user_id: int
    status: ApplicationStatus
    cover_letter: Optional[str] = None
    applied_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Application Detail Response Schema (includes job and user info)
class ApplicationDetailResponse(ApplicationResponse):
    """Schema for detailed application response."""
    job_title: str
    job_description: str
    job_salary_min: Optional[int] = None
    job_salary_max: Optional[int] = None
    job_location: Optional[str] = None
    employer_name: Optional[str] = None
    company_name: Optional[str] = None
    applicant_name: Optional[str] = None
    applicant_email: str
    applicant_skills: Optional[list] = None
    applicant_resume_url: Optional[str] = None


# Application List Query Parameters
class ApplicationQueryParams(BaseModel):
    """Schema for application list query parameters."""
    job_id: Optional[int] = None
    status: Optional[ApplicationStatus] = None
    skip: int = 0
    limit: int = 20
