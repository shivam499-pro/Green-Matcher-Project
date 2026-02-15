"""
Green Matchers - User Schemas
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from apps.backend.models.user import UserRole


# Base User Schema
class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    full_name: Optional[str] = None


# User Registration Schema
class UserRegister(BaseModel):
    """
    Schema for user registration.
    Note: role is set server-side only (default: USER)
    """
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    full_name: Optional[str] = None
    language: str = "en"


# User Login Schema
class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


# User Update Schema
class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = None
    language: Optional[str] = None
    skills: Optional[List[str]] = None
    resume_url: Optional[str] = None


# Employer Profile Update Schema
class EmployerProfileUpdate(BaseModel):
    """Schema for updating employer profile."""
    company_name: Optional[str] = None
    company_description: Optional[str] = None
    company_website: Optional[str] = None


# User Response Schema (Full - for authenticated requests)
class UserResponse(BaseModel):
    """Schema for user response (includes all fields)."""
    id: int
    email: str
    full_name: Optional[str] = None
    role: UserRole
    skills: Optional[List[str]] = None
    resume_url: Optional[str] = None
    language: str
    company_name: Optional[str] = None
    company_description: Optional[str] = None
    company_website: Optional[str] = None
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# User Public Profile Schema (limited data for public endpoints)
class UserPublicProfile(BaseModel):
    """Schema for public user profile (limited data, no sensitive info)."""
    id: int
    full_name: Optional[str] = None
    skills: Optional[List[str]] = None
    resume_url: Optional[str] = None
    company_name: Optional[str] = None
    company_description: Optional[str] = None
    company_website: Optional[str] = None

    model_config = {"from_attributes": True}


# Token Response Schema
class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Skills Update Schema
class SkillsUpdate(BaseModel):
    """Schema for updating user skills."""
    skills: List[str] = Field(..., min_length=1, description="At least one skill is required")
