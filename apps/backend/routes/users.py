"""
Green Matchers - Users Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.deps import DatabaseSession, get_current_user
from models.user import User
from schemas.user import UserResponse, UserUpdate, EmployerProfileUpdate, SkillsUpdate

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: DatabaseSession
):
    """
    Get current user information.
    """
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: DatabaseSession
):
    """
    Update current user profile.
    """
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields if provided
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.language is not None:
        user.language = user_update.language
    if user_update.skills is not None:
        user.skills = user_update.skills
    if user_update.resume_url is not None:
        user.resume_url = user_update.resume_url
    
    db.commit()
    db.refresh(user)
    
    return user


@router.put("/me/employer-profile", response_model=UserResponse)
def update_employer_profile(
    profile_update: EmployerProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: DatabaseSession
):
    """
    Update employer profile information.
    """
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role.value != "EMPLOYER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can update employer profile"
        )
    
    # Update employer fields if provided
    if profile_update.company_name is not None:
        user.company_name = profile_update.company_name
    if profile_update.company_description is not None:
        user.company_description = profile_update.company_description
    if profile_update.company_website is not None:
        user.company_website = profile_update.company_website
    
    db.commit()
    db.refresh(user)
    
    return user


@router.put("/me/skills", response_model=UserResponse)
def update_user_skills(
    skills_update: SkillsUpdate,
    current_user: dict = Depends(get_current_user),
    db: DatabaseSession
):
    """
    Update user skills.
    """
    user = db.query(User).filter(User.id == int(current_user["user_id"])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.skills = skills_update.skills
    db.commit()
    db.refresh(user)
    
    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: DatabaseSession
):
    """
    Get user by ID (public profile).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
