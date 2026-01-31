"""
Green Matchers - User Schemas
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models.user import UserRole


# Base User Schema
class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.USER


# User Registration Schema
class UserRegister(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
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


# User Response Schema
class UserResponse(BaseModel):
    """Schema for user response."""
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

    class Config:
        from_attributes = True


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
