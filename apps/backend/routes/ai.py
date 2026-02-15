"""
AI Routes for Green Matchers
AI-powered job and career recommendations, skill matching, and semantic search
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import joinedload

from apps.backend.core.deps import DatabaseSession, get_current_user
from apps.backend.models.job import Job
from apps.backend.models.career import Career
from apps.backend.models.user import User

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/recommendations/jobs")
def get_job_recommendations(
    db: DatabaseSession,
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """
    Get personalized job recommendations based on user profile.
    """
    recommendations = []
    user_skills = [s.lower() for s in (current_user.skills or [])]
    jobs = (
        db.query(Job)
        .options(joinedload(Job.employer))
        .filter(Job.is_verified == True)
        .limit(limit * 2)
        .all()
    )
    
    for job in jobs[:limit]:
        job_skills = [s.lower() for s in (job.required_skills or [])]
        if job_skills:
            match_score = len(set(user_skills) & set(job_skills)) / len(job_skills) * 100
        else:
            match_score = 0.0
        
        recommendations.append({
            "job_id": job.id,
            "job_title": job.title,
            "match_score": round(match_score, 2),
            "company_name": job.employer.company_name if job.employer else None,
            "location": job.location,
            "salary_range": f"{job.salary_min}-{job.salary_max}" if job.salary_min and job.salary_max else None,
            "matched_skills": list(set(user_skills) & set(job_skills)),
            "reason": "Based on your skills and experience"
        })
    
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)
    return {"recommendations": recommendations, "total": len(recommendations)}


@router.get("/recommendations/careers")
def get_career_recommendations(
    db: DatabaseSession,
    skills: Optional[str] = None,
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """
    Get career path recommendations based on user skills.
    """
    user_skills = [s.lower() for s in (current_user.skills or [])]
    if skills:
        user_skills = [s.strip().lower() for s in skills.split(",")]
    
    all_careers = db.query(Career).limit(limit * 2).all()
    
    recommendations = []
    for career in all_careers[:limit]:
        career_skills = [s.lower() for s in (career.required_skills or [])]
        if career_skills:
            match_score = len(set(user_skills) & set(career_skills)) / len(career_skills) * 100
        else:
            match_score = 0.0
        
        recommendations.append({
            "career_id": career.id,
            "career_title": career.title,
            "match_score": round(match_score, 2),
            "growth_potential": career.growth_potential,
            "demand_score": career.demand_score,
            "avg_salary": career.avg_salary or career.avg_salary_min,
            "reason": f"Matches {len(set(user_skills) & set(career_skills))} of your skills"
        })
    
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)
    return {"recommendations": recommendations, "total": len(recommendations)}


@router.post("/match/job/{job_id}")
def match_skills_to_job(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze how well user's skills match a specific job requirement.
    """
    job = (
        db.query(Job)
        .options(joinedload(Job.employer))
        .filter(Job.id == job_id, Job.is_verified == True)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    user_skills = [s.lower() for s in (current_user.skills or [])]
    job_skills = [s.lower() for s in (job.required_skills or [])]
    matched_skills = list(set(user_skills) & set(job_skills))
    missing_skills = list(set(job_skills) - set(user_skills))
    
    if job_skills:
        match_percentage = len(matched_skills) / len(job_skills) * 100
    else:
        match_percentage = 0.0
    
    return {
        "job_id": job_id,
        "job_title": job.title,
        "match_percentage": round(match_percentage, 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggested_improvements": [f"Consider learning {skill}" for skill in missing_skills[:5]]
    }


@router.post("/skill-gap/{job_id}")
def analyze_skill_gap(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze skill gaps for a target job.
    """
    job = (
        db.query(Job)
        .options(joinedload(Job.employer))
        .filter(Job.id == job_id, Job.is_verified == True)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    user_skills = set([s.lower() for s in (current_user.skills or [])])
    job_skills = set([s.lower() for s in (job.required_skills or [])])
    missing_skills = list(job_skills - user_skills)
    
    learning_suggestions = []
    for skill in missing_skills:
        learning_suggestions.append({
            "skill": skill,
            "priority": "High",
            "resources": [f"Online course: {skill} fundamentals"]
        })
    
    return {
        "job_title": job.title,
        "missing_required_skills": missing_skills,
        "learning_suggestions": learning_suggestions
    }


@router.get("/learning-path/{career_id}")
def get_learning_path(
    career_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Get a personalized learning path for a target career.
    """
    career = db.query(Career).filter(Career.id == career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    
    user_skills = set([s.lower() for s in (current_user.skills or [])])
    required_skills = set([s.lower() for s in (career.required_skills or [])])
    missing_skills = list(required_skills - user_skills)
    
    path = []
    for i, skill in enumerate(missing_skills):
        path.append({
            "step": i + 1,
            "skill": skill,
            "duration": f"{3 + (i % 3)}-4 weeks"
        })
    
    return {
        "career": career.title,
        "skills_to_learn": missing_skills,
        "learning_path": path
    }


@router.post("/generate-cover-letter")
def generate_cover_letter(
    job_id: int,
    db: DatabaseSession,
    additional_info: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a personalized cover letter for a job application.
    """
    job = (
        db.query(Job)
        .options(joinedload(Job.employer))
        .filter(Job.id == job_id, Job.is_verified == True)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    user = current_user
    primary_skills = user.skills[:3] if user.skills else ["relevant skills"]
    cover_letter = f"""
Dear Hiring Manager,

I am writing to express my strong interest in the {job.title} position at {job.employer.company_name if job.employer else 'your company'}. 
With my background in {', '.join(primary_skills)}, I am confident that I would be 
a valuable addition to your team.

{additional_info or 'I am particularly drawn to this opportunity because of my passion for sustainable development.'}

Thank you for considering my application.

Sincerely,
{user.full_name or user.email}
"""
    return {"cover_letter": cover_letter.strip(), "job_id": job_id}


@router.get("/interview-tips/{job_id}")
def get_interview_tips(
    job_id: int,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-generated interview preparation tips for a specific job.
    """
    job = (
        db.query(Job)
        .options(joinedload(Job.employer))
        .filter(Job.id == job_id, Job.is_verified == True)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job_skills = job.required_skills or []
    tips = {
        "general_tips": ["Research the company's mission", "Prepare examples of achievements"],
        "technical_tips": [f"Review {', '.join(job_skills[:3]) if job_skills else 'skills'} fundamentals"],
        "questions_to_ask": ["What are the team's goals?", "How does the company measure sustainability?"]
    }
    return {"job_title": job.title, "tips": tips}


@router.post("/search/jobs")
def semantic_job_search(
    query: str,
    db: DatabaseSession,
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """
    Perform semantic search on jobs using keyword matching.
    Note: True semantic search requires embeddings - this is a keyword fallback.
    """
    all_jobs = (
        db.query(Job)
        .options(joinedload(Job.employer))
        .filter(Job.is_verified == True)
        .limit(limit * 2)
        .all()
    )
    query_words = query.lower().split()
    results = []
    
    for job in all_jobs:
        job_text = f"{job.title or ''} {job.description or ''}".lower()
        score = sum(1 for word in query_words if word in job_text)
        if score > 0:
            results.append({
                "job_id": job.id,
                "job_title": job.title,
                "company_name": job.employer.company_name if job.employer else None,
                "location": job.location,
                "relevance_score": score / len(query_words) * 100
            })
    
    results.sort(key=lambda x: x['relevance_score'], reverse=True)
    return {"query": query, "results": results[:limit], "total": len(results[:limit])}


@router.post("/resume/parse")
def parse_resume(
    resume_text: str,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Parse resume text and extract skills.
    
    Args:
        resume_text: Raw text from resume
        
    Returns:
        Dict: Extracted skills and analysis
    """
    from apps.backend.services.ai.resume import resume_service
    
    # Extract skills from resume text
    extracted = resume_service.extract_skills_from_text(resume_text)
    
    # Get extraction summary
    summary = resume_service.get_extraction_summary(extracted)
    
    return {
        "success": True,
        "skills": extracted.all_skills,
        "technical_skills": extracted.technical_skills,
        "soft_skills": extracted.soft_skills,
        "green_skills": extracted.green_skills,
        "confidence_score": extracted.confidence_score,
        "sections": extracted.sections,
        "summary": summary
    }


@router.post("/resume/upload")
def upload_resume(
    file_content: str,
    file_type: str = "txt",
    db: DatabaseSession = None,
    current_user: User = Depends(get_current_user)
):
    """
    Upload and parse a resume file.
    
    Supports: txt, json
    
    Args:
        file_content: Base64 encoded file content or raw text
        file_type: Type of file (txt, json)
        
    Returns:
        Dict: Extracted skills and analysis
    """
    import base64
    from apps.backend.services.ai.resume import resume_service
    
    try:
        # Try to decode base64, if fails use as raw text
        try:
            content = base64.b64decode(file_content)
        except:
            content = file_content.encode('utf-8')
        
        # Parse the resume file
        extracted = resume_service.parse_resume_file(content, file_type)
        
        # Get extraction summary
        summary = resume_service.get_extraction_summary(extracted)
        
        return {
            "success": True,
            "skills": extracted.all_skills,
            "technical_skills": extracted.technical_skills,
            "soft_skills": extracted.soft_skills,
            "green_skills": extracted.green_skills,
            "confidence_score": extracted.confidence_score,
            "summary": summary
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "skills": [],
            "technical_skills": [],
            "soft_skills": [],
            "green_skills": [],
            "confidence_score": 0.0
        }


@router.post("/resume/update-skills")
def update_skills_from_resume(
    resume_text: str,
    db: DatabaseSession,
    current_user: User = Depends(get_current_user)
):
    """
    Parse resume and update user's skills in profile.
    
    Args:
        resume_text: Raw text from resume
        
    Returns:
        Dict: Updated skills and confirmation
    """
    from apps.backend.services.ai.resume import resume_service
    
    # Extract skills from resume text
    extracted = resume_service.extract_skills_from_text(resume_text)
    
    # Update user's skills
    if extracted.all_skills:
        current_user.skills = extracted.all_skills
        db.commit()
        db.refresh(current_user)
    
    return {
        "success": True,
        "message": f"Updated {len(extracted.all_skills)} skills from resume",
        "skills": current_user.skills,
        "technical_skills": extracted.technical_skills,
        "soft_skills": extracted.soft_skills,
        "green_skills": extracted.green_skills,
        "confidence_score": extracted.confidence_score
    }
