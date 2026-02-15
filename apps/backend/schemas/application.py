"""
Green Matchers - Application Schemas
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from apps.backend.models.application import ApplicationStatus


# 1️⃣ ApplicationCreate - Job Seeker Applies
class ApplicationCreate(BaseModel):
    """Schema for creating a new application (job seeker only)."""
    job_id: int
    cover_letter: Optional[str] = None


# 2️⃣ ApplicationResponse - Job Seeker View
class ApplicationResponse(BaseModel):
    """Schema for job seeker viewing their applications."""
    id: int
    job_id: int
    user_id: int
    status: ApplicationStatus
    cover_letter: Optional[str] = None
    applied_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# 3️⃣ ApplicationForEmployerResponse - Employer/Admin View
class ApplicationForEmployerResponse(BaseModel):
    """Schema for employer viewing job applicants."""
    id: int
    job_id: int
    user_id: int
    applicant_name: str
    applicant_email: str
    status: ApplicationStatus
    cover_letter: Optional[str] = None
    applied_at: datetime

    model_config = {"from_attributes": True}


# Application Status Update Schema (for employers to change status)
class ApplicationStatusUpdate(BaseModel):
    """Schema for updating application status (employers only)."""
    status: ApplicationStatus


# Application Detail Response (includes job info)
class ApplicationDetailResponse(ApplicationResponse):
    """Schema for detailed application view."""
    job_title: str
    job_description: str
    job_salary_min: Optional[int] = None
    job_salary_max: Optional[int] = None
    job_location: Optional[str] = None
    employer_name: Optional[str] = None
    company_name: Optional[str] = None
    applicant_skills: Optional[list] = None
    applicant_resume_url: Optional[str] = None


# Phase 2.7 - Visibility-Safe Response Schemas
# =============================================
# These schemas enforce data visibility based on user role and application status.
# No sensitive contact information is exposed in general responses.


class ApplicationUserResponse(BaseModel):
    """Response schema for job seekers viewing their applications.
    
    Excludes employer contact information and internal notes.
    """
    id: int
    job_id: int
    job_title: str
    company_name: str
    status: ApplicationStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class ApplicationEmployerResponse(BaseModel):
    """Response schema for employers viewing pending/rejected applications.
    
    Excludes candidate contact information (email, phone).
    """
    id: int
    job_id: int
    candidate_id: int
    candidate_name: str
    candidate_skills: Optional[list] = None
    status: ApplicationStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class ApplicationEmployerAcceptedResponse(ApplicationEmployerResponse):
    """Response schema for employers viewing ACCEPTED applications only.
    
    Includes candidate contact information (email, phone) - ONLY for accepted candidates.
    This schema is structurally different from ApplicationEmployerResponse,
    enforcing selection at the route layer (not conditionally within the schema).
    """
    candidate_email: str
    candidate_phone: Optional[str] = None
