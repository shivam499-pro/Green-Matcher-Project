"""
Green Matchers - Production Database Seeding Script

This script seeds the database with comprehensive demo data for the Green Matchers
platform. It ensures proper relationships between careers, jobs, users, and applications.

Usage:
    python -m apps.backend.scripts.seed_production
    or
    cd apps/backend && python scripts/seed_production.py

Environment:
    - Set ENVIRONMENT=production to skip demo seeding
    - Set ADMIN_PASSWORD for admin user creation
"""
import os
import sys
from datetime import datetime, timezone

# Ensure the backend directory is in the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session

from apps.backend.models.user import User, UserRole
from apps.backend.models.career import Career
from apps.backend.models.job import Job, JobStatus
from apps.backend.models.application import Application, ApplicationStatus
from apps.backend.models.analytics import Analytics

from apps.backend.core.security import get_password_hash
from apps.backend.db import SessionLocal, init_db


# =============================================================================
# CAREER DATA
# =============================================================================

def get_careers_data() -> list[dict]:
    """Return career data with skills aligned for matching."""
    return [
        {
            "title": "Solar Energy Engineer",
            "description": "Design and develop solar energy systems for residential and commercial properties.",
            "required_skills": ["Engineering", "Solar Technology", "Electrical Systems", "Project Management", "AutoCAD"],
            "sdg_tags": [7, 9, 13],  # Affordable Clean Energy, Industry Innovation, Climate Action
            "avg_salary_min": 500000,
            "avg_salary_max": 800000,
            "avg_salary": 650000,
            "growth_potential": "High",
            "demand_score": 0.85,
            "is_active": True
        },
        {
            "title": "Wind Turbine Technician",
            "description": "Install, maintain, and repair wind turbine equipment.",
            "required_skills": ["Electrical Systems", "Mechanical Systems", "Safety Protocols", "Physical Stamina", "SCADA"],
            "sdg_tags": [7, 8, 13],  # Affordable Clean Energy, Decent Work, Climate Action
            "avg_salary_min": 350000,
            "avg_salary_max": 550000,
            "avg_salary": 450000,
            "growth_potential": "Medium",
            "demand_score": 0.72,
            "is_active": True
        },
        {
            "title": "Sustainable Agriculture Specialist",
            "description": "Develop and implement sustainable farming practices and organic agriculture.",
            "required_skills": ["Agricultural Science", "Soil Management", "Water Conservation", "Organic Farming", "GIS"],
            "sdg_tags": [2, 6, 12, 13, 15],  # Zero Hunger, Clean Water, Responsible Consumption, Climate Action, Life on Land
            "avg_salary_min": 400000,
            "avg_salary_max": 650000,
            "avg_salary": 525000,
            "growth_potential": "High",
            "demand_score": 0.82,
            "is_active": True
        },
        {
            "title": "Environmental Consultant",
            "description": "Advise organizations on environmental compliance and sustainability practices.",
            "required_skills": ["Environmental Science", "Regulatory Compliance", "Report Writing", "Client Management", "ISO 14001"],
            "sdg_tags": [12, 13, 15],  # Responsible Consumption, Climate Action, Life on Land
            "avg_salary_min": 400000,
            "avg_salary_max": 700000,
            "avg_salary": 550000,
            "growth_potential": "High",
            "demand_score": 0.78,
            "is_active": True
        },
        {
            "title": "Carbon Analyst",
            "description": "Analyze carbon footprints and develop reduction strategies for organizations.",
            "required_skills": ["Data Analysis", "Carbon Accounting", "Environmental Science", "Excel", "Python"],
            "sdg_tags": [7, 13, 17],  # Affordable Clean Energy, Climate Action, Partnerships
            "avg_salary_min": 450000,
            "avg_salary_max": 750000,
            "avg_salary": 600000,
            "growth_potential": "Very High",
            "demand_score": 0.82,
            "is_active": True
        },
        {
            "title": "Electric Vehicle Engineer",
            "description": "Design and develop electric vehicle systems and components.",
            "required_skills": ["Electrical Engineering", "Battery Technology", "Automotive Systems", "CAD", "MATLAB"],
            "sdg_tags": [7, 9, 11, 13],  # Clean Energy, Innovation, Cities, Climate
            "avg_salary_min": 550000,
            "avg_salary_max": 900000,
            "avg_salary": 725000,
            "growth_potential": "Very High",
            "demand_score": 0.91,
            "is_active": True
        },
        {
            "title": "Sustainability Manager",
            "description": "Lead corporate sustainability initiatives and environmental programs.",
            "required_skills": ["Strategic Planning", "Sustainability Reporting", "Stakeholder Management", "Data Analysis", "ESG"],
            "sdg_tags": [8, 12, 13],  # Decent Work, Responsible Consumption, Climate Action
            "avg_salary_min": 600000,
            "avg_salary_max": 1000000,
            "avg_salary": 800000,
            "growth_potential": "Very High",
            "demand_score": 0.88,
            "is_active": True
        },
        {
            "title": "Water Conservation Specialist",
            "description": "Develop water management strategies for agriculture and urban areas.",
            "required_skills": ["Hydrology", "Water Management", "Environmental Engineering", "GIS", "Remote Sensing"],
            "sdg_tags": [6, 11, 13, 15],  # Clean Water, Cities, Climate, Life on Land
            "avg_salary_min": 400000,
            "avg_salary_max": 700000,
            "avg_salary": 550000,
            "growth_potential": "High",
            "demand_score": 0.75,
            "is_active": True
        },
        {
            "title": "Green Building Consultant",
            "description": "Advise on sustainable building design and LEED certification.",
            "required_skills": ["LEED Certification", "Building Design", "Energy Efficiency", "Construction Management", "Revit"],
            "sdg_tags": [7, 9, 11, 13],  # Clean Energy, Innovation, Cities, Climate
            "avg_salary_min": 500000,
            "avg_salary_max": 850000,
            "avg_salary": 675000,
            "growth_potential": "High",
            "demand_score": 0.80,
            "is_active": True
        },
        {
            "title": "Waste Management Engineer",
            "description": "Design and implement waste reduction and recycling systems.",
            "required_skills": ["Waste Management", "Environmental Engineering", "Recycling Technology", "Operations Management", "Public Education"],
            "sdg_tags": [11, 12, 13],  # Sustainable Cities, Responsible Consumption, Climate Action
            "avg_salary_min": 350000,
            "avg_salary_max": 600000,
            "avg_salary": 475000,
            "growth_potential": "Medium",
            "demand_score": 0.65,
            "is_active": True
        },
    ]


# =============================================================================
# USER DATA
# =============================================================================

def get_users_data() -> list[dict]:
    """Return user data with skills aligned with career requirements."""
    return [
        {
            "email": "admin@greenmatchers.com",
            "password_hash": None,  # Will be set from ADMIN_PASSWORD env var
            "full_name": "System Administrator",
            "role": UserRole.ADMIN,
            "skills": ["Python", "SQL", "System Administration", "Security"],
            "is_verified": 1,
            "language": "en"
        },
        {
            "email": "employer@greenmatchers.com",
            "password_hash": get_password_hash("employer123"),
            "full_name": "Green Energy Corp",
            "role": UserRole.EMPLOYER,
            "skills": [],
            "company_name": "Green Energy Corp",
            "company_description": "Leading renewable energy company specializing in solar, wind, and energy storage solutions across India.",
            "company_website": "https://greenenergy.example.com",
            "company_description_long": "Green Energy Corp is a pioneer in renewable energy solutions, operating 50+ solar farms and 20 wind installations across India.",
            "is_verified": 1,
            "language": "en"
        },
        {
            "email": "jobseeker.solar@example.com",
            "password_hash": get_password_hash("seeker123"),
            "full_name": "Priya Sharma",
            "role": UserRole.USER,
            "skills": ["Solar Technology", "Electrical Systems", "Project Management", "AutoCAD", "Python"],
            "resume_url": "https://example.com/resumes/priya.pdf",
            "language": "en"
        },
        {
            "email": "jobseeker.environment@example.com",
            "password_hash": get_password_hash("seeker123"),
            "full_name": "Rajesh Kumar",
            "role": UserRole.USER,
            "skills": ["Environmental Science", "Regulatory Compliance", "Report Writing", "ISO 14001", "Data Analysis"],
            "resume_url": "https://example.com/resumes/rajesh.pdf",
            "language": "en"
        },
        {
            "email": "jobseeker.ev@example.com",
            "password_hash": get_password_hash("seeker123"),
            "full_name": "Anita Desai",
            "role": UserRole.USER,
            "skills": ["Electrical Engineering", "Battery Technology", "Automotive Systems", "MATLAB", "CAD"],
            "resume_url": "https://example.com/resumes/anita.pdf",
            "language": "en"
        },
        {
            "email": "jobseeker.sustainability@example.com",
            "password_hash": get_password_hash("seeker123"),
            "full_name": "Vikram Singh",
            "role": UserRole.USER,
            "skills": ["Sustainability Reporting", "ESG", "Stakeholder Management", "Strategic Planning", "Excel"],
            "resume_url": "https://example.com/resumes/vikram.pdf",
            "language": "en"
        },
        {
            "email": "jobseeker.data@example.com",
            "password_hash": get_password_hash("seeker123"),
            "full_name": "Meera Patel",
            "role": UserRole.USER,
            "skills": ["Python", "Data Analysis", "Carbon Accounting", "Excel", "SQL"],
            "resume_url": "https://example.com/resumes/meera.pdf",
            "language": "en"
        },
        {
            "email": "employer2@greenmatchers.com",
            "password_hash": get_password_hash("employer123"),
            "full_name": "EcoTech Solutions",
            "role": UserRole.EMPLOYER,
            "skills": [],
            "company_name": "EcoTech Solutions",
            "company_description": "Innovative cleantech startup focused on water purification and waste management.",
            "company_website": "https://ecotech.example.com",
            "is_verified": 1,
            "language": "en"
        },
    ]


# =============================================================================
# JOB DATA
# =============================================================================

def get_jobs_data(employers: list, careers: list) -> list[dict]:
    """Return job data - at least one job per career."""
    employer1 = employers[0] if len(employers) > 0 else None
    employer2 = employers[1] if len(employers) > 1 else None

    jobs = []

    # Ensure at least one job per career
    for i, career in enumerate(careers):
        employer = employer1 if i % 2 == 0 else employer2
        if not employer:
            employer = employer1

        if i == 0:  # Solar Energy Engineer
            jobs.append({
                "employer_id": employer.id,
                "career_id": career.id,
                "title": "Senior Solar Energy Engineer",
                "description": "Lead our solar energy projects across India. Responsible for system design, installation oversight, and team management.",
                "requirements": "5+ years in solar energy\nBachelor's in Electrical/Mechanical Engineering\nPE license preferred\nExperience with utility-scale projects",
                "job_type": "full-time",
                "required_skills": career.required_skills,
                "preferred_skills": ["PE License", "Utility-scale", "Team Leadership"],
                "experience_level": "senior",
                "salary_min": 600000,
                "salary_max": 900000,
                "location": "Bangalore, Karnataka",
                "is_remote": False,
                "sdg_tags": career.sdg_tags,
                "status": JobStatus.OPEN,
                "is_verified": True,
                "is_active": True
            })
            # Additional job for high-demand career
            jobs.append({
                "employer_id": employer.id,
                "career_id": career.id,
                "title": "Solar Project Manager",
                "description": "Manage residential and commercial solar installations. Coordinate with clients, contractors, and utility companies.",
                "requirements": "3+ years in solar project management\nStrong client communication skills\nPMP certification a plus",
                "job_type": "full-time",
                "required_skills": ["Project Management", "Solar Technology", "Client Management"],
                "preferred_skills": ["PMP", "Salesforce", "CRM"],
                "experience_level": "mid",
                "salary_min": 500000,
                "salary_max": 700000,
                "location": "Pune, Maharashtra",
                "is_remote": False,
                "sdg_tags": career.sdg_tags,
                "status": JobStatus.OPEN,
                "is_verified": True,
                "is_active": True
            })

        elif i == 1:  # Wind Turbine Technician
            jobs.append({
                "employer_id": employer.id,
                "career_id": career.id,
                "title": "Wind Turbine Maintenance Technician",
                "description": "Perform preventive and corrective maintenance on wind turbines. Ensure optimal performance and safety compliance.",
                "requirements": "2+ years wind turbine experience\nElectrical/Mechanical certification\nAbility to work at heights up to 100m\nStrong safety consciousness",
                "job_type": "full-time",
                "required_skills": career.required_skills,
                "preferred_skills": ["WindPRO", "SAP", "Hydraulic Systems"],
                "experience_level": "mid",
                "salary_min": 400000,
                "salary_max": 550000,
                "location": "Tamil Nadu (Nellai Wind Farm)",
                "is_remote": False,
                "sdg_tags": career.sdg_tags,
                "status": JobStatus.OPEN,
                "is_verified": True,
                "is_active": True
            })

        elif i == 2:  # Sustainable Agriculture
            jobs.append({
                "employer_id": employer.id,
                "career_id": career.id,
                "title": "Sustainable Agriculture Specialist",
                "description": "Develop and implement organic farming practices. Work with farmers to increase crop yields while reducing environmental impact.",
                "requirements": "MS in Agricultural Science or related\n5+ years field experience\nOrganic certification knowledge\nWillingness to travel to rural areas",
                "job_type": "full-time",
                "required_skills": career.required_skills,
                "preferred_skills": ["Organic Certification", "Agroforestry", "Permaculture"],
                "experience_level": "senior",
                "salary_min": 450000,
                "salary_max": 650000,
                "location": "Coimbatore, Tamil Nadu",
                "is_remote": False,
                "sdg_tags": career.sdg_tags,
                "status": JobStatus.OPEN,
                "is_verified": True,
                "is_active": True
            })

        elif i == 3:  # Environmental Consultant
            jobs.append({
                "employer_id": employer.id,
                "career_id": career.id,
                "title": "Environmental Compliance Consultant",
                "description": "Guide clients through environmental regulations and compliance. Conduct assessments and prepare documentation.",
                "requirements": "4+ years environmental consulting\nExperience with Indian environmental laws\nEIA report preparation\Strong analytical skills",
                "job_type": "full-time",
                "required_skills": career.required_skills,
                "preferred_skills": ["MoEFCC", "PCB", "ISO 14001 Lead Auditor"],
                "experience_level": "senior",
                "salary_min": 550000,
                "salary_max": 800000,
                "location": "Mumbai, Maharashtra",
                "is_remote": False,
                "sdg_tags": career.sdg_tags,
                "status": JobStatus.OPEN,
                "is_verified": True,
                "is_active": True
            })

        elif i == 4:  # Carbon Analyst
            jobs.append({
                "employer_id": employer.id,
                "career_id": career.id,
                "title": "Carbon Footprint Analyst",
                "description": "Calculate and analyze carbon footprints for corporate clients. Develop emission reduction strategies.",
                "requirements": "2+ years in carbon accounting\nGHG Protocol certification\nStrong Excel and data skills\nExperience with carbon markets preferred",
                "job_type": "full-time",
                "required_skills": career.required_skills,
                "preferred_skills": ["GHG Protocol", "CDP", "Salesforce"],
                "experience_level": "mid",
                "salary_min": 500000,
                "salary_max": 700000,
                "location": "Bangalore, Karnataka (Hybrid)",
                "is_remote": True,
                "sdg_tags": career.sdg_tags,
                "status": JobStatus.OPEN,
                "is_verified": True,
                "is_active": True
            })

        elif i == 5:  # EV Engineer
            jobs.append({
                "employer_id": employer.id,
                "career_id": career.id,
                "title": "EV Battery Systems Engineer",
                "description": "Design and develop battery management systems for electric vehicles. Work on next-generation energy storage solutions.",
                "requirements": "MS in Electrical/Battery Engineering\n3+ years in EV battery development\nExperience with BMS design\nKnowledge of safety standards (UL, UN38.3)",
                "job_type": "full-time",
                "required_skills": career.required_skills,
                "preferred_skills": ["Simulink", "LTspice", "Battery Modeling"],
                "experience_level": "senior",
                "salary_min": 700000,
                "salary_max": 1000000,
                "location": "Bangalore, Karnataka",
                "is_remote": False,
                "sdg_tags": career.sdg_tags,
                "status": JobStatus.OPEN,
                "is_verified": True,
                "is_active": True
            })

        elif i == 6:  # Sustainability Manager
            jobs.append({
                "employer_id": employer.id,
                "career_id": career.id,
                "title": "Corporate Sustainability Manager",
                "description": "Lead sustainability strategy for a Fortune 500 company. Manage ESG reporting and stakeholder engagement.",
                "requirements": "8+ years sustainability experience\nMBA or Master's in Sustainability\nGRI certification\nProven track record in ESG leadership",
                "job_type": "full-time",
                "required_skills": career.required_skills,
                "preferred_skills": ["GRI Standards", "SASB", "TCFD", "CDP"],
                "experience_level": "executive",
                "salary_min": 900000,
                "salary_max": 1500000,
                "location": "Mumbai, Maharashtra",
                "is_remote": False,
                "sdg_tags": career.sdg_tags,
                "status": JobStatus.OPEN,
                "is_verified": True,
                "is_active": True
            })
            # Additional job
            jobs.append({
                "employer_id": employer.id,
                "career_id": career.id,
                "title": "ESG Reporting Specialist",
                "description": "Support sustainability reporting and data collection. Coordinate with various departments for ESG metrics.",
                "requirements": "3+ years ESG/sustainability experience\nStrong data management skills\nExperience with sustainability platforms",
                "job_type": "full-time",
                "required_skills": ["Data Analysis", "Sustainability Reporting", "Excel"],
                "preferred_skills": ["Workiva", "Enablon", "SAP Sustainability"],
                "experience_level": "mid",
                "salary_min": 450000,
                "salary_max": 650000,
                "location": "Remote (India)",
                "is_remote": True,
                "sdg_tags": career.sdg_tags,
                "status": JobStatus.OPEN,
                "is_verified": True,
                "is_active": True
            })

        elif i == 7:  # Water Conservation
            jobs.append({
                "employer_id": employer.id,
                "career_id": career.id,
                "title": "Water Resources Engineer",
                "description": "Design water management systems for urban and agricultural use. Work on rainwater harvesting and wastewater treatment.",
                "requirements": "4+ years water resources engineering\nPE license\nExperience with stormwater management\nGIS proficiency",
                "job_type": "full-time",
                "required_skills": career.required_skills,
                "preferred_skills": ["SWMM", "HEC-RAS", "AutoCAD Civil 3D"],
                "experience_level": "senior",
                "salary_min": 500000,
                "salary_max": 750000,
                "location": "Chennai, Tamil Nadu",
                "is_remote": False,
                "sdg_tags": career.sdg_tags,
                "status": JobStatus.OPEN,
                "is_verified": True,
                "is_active": True
            })

        elif i == 8:  # Green Building
            jobs.append({
                "employer_id": employer.id,
                "career_id": career.id,
                "title": "LEED Green Associate",
                "description": "Guide building projects through LEED certification. Conduct energy audits and recommend efficiency improvements.",
                "requirements": "LEED Green Associate certification\n2+ years building sustainability experience\nStrong knowledge of green building standards",
                "job_type": "full-time",
                "required_skills": career.required_skills,
                "preferred_skills": ["LEED AP", "WELL AP", "Energy Star"],
                "experience_level": "mid",
                "salary_min": 450000,
                "salary_max": 650000,
                "location": "Hyderabad, Telangana",
                "is_remote": False,
                "sdg_tags": career.sdg_tags,
                "status": JobStatus.OPEN,
                "is_verified": True,
                "is_active": True
            })

        elif i == 9:  # Waste Management
            jobs.append({
                "employer_id": employer.id,
                "career_id": career.id,
                "title": "Waste Management Engineer",
                "description": "Design and implement waste processing facilities. Develop recycling programs and circular economy solutions.",
                "requirements": "4+ years waste management engineering\nExperience with waste-to-energy projects\nKnowledge of Indian waste regulations",
                "job_type": "full-time",
                "required_skills": career.required_skills,
                "preferred_skills": ["Waste-to-Energy", "Anaerobic Digestion", "Plastics Recycling"],
                "experience_level": "senior",
                "salary_min": 450000,
                "salary_max": 700000,
                "location": "Delhi NCR",
                "is_remote": False,
                "sdg_tags": career.sdg_tags,
                "status": JobStatus.OPEN,
                "is_verified": True,
                "is_active": True
            })

    return jobs


# =============================================================================
# APPLICATION DATA
# =============================================================================

def get_applications_data(jobs: list, users: list) -> list[dict]:
    """Return application data - multiple applications per job with aligned skills."""
    applications = []
    jobseekers = [u for u in users if u.role == UserRole.USER]

    # Create multiple applications per job
    for job in jobs:
        # Get matching users based on skill overlap
        matching_users = []
        for user in jobseekers:
            if user.skills and job.required_skills:
                skill_overlap = len(set(user.skills) & set(job.required_skills))
                if skill_overlap >= 2:  # At least 2 matching skills
                    matching_users.append(user)

        # Ensure at least 2 applications per job
        if len(matching_users) == 0:
            matching_users = jobseekers[:2]
        elif len(matching_users) == 1:
            matching_users.append(jobseekers[(jobseekers.index(matching_users[0]) + 1) % len(jobseekers)])

        for idx, user in enumerate(matching_users[:3]):  # Max 3 applications per job
            status = ApplicationStatus.PENDING
            if idx == 0:
                status = ApplicationStatus.PENDING
            elif idx == 1:
                status = ApplicationStatus.REVIEWED
            else:
                status = ApplicationStatus.ACCEPTED

            # Calculate skill match percentage
            if user.skills and job.required_skills:
                match_percent = round(len(set(user.skills) & set(job.required_skills)) / len(job.required_skills) * 100, 1)
            else:
                match_percent = 0

            applications.append({
                "job_id": job.id,
                "user_id": user.id,
                "status": status,
                "cover_letter": f"I am excited to apply for the {job.title} position. My background in {', '.join(user.skills[:2]) if user.skills else 'sustainability'} aligns well with your requirements. I am passionate about contributing to environmental solutions and believe my skills would be valuable to your team.",
                "match_score": match_percent,
                "applied_at": datetime.now(timezone.utc)
            })

    return applications


# =============================================================================
# ANALYTICS DATA
# =============================================================================

def get_analytics_data(careers: list, jobs: list) -> list[dict]:
    """Return analytics data with career demand metrics."""
    career_demand = []
    for career in careers:
        career_jobs = [j for j in jobs if j.career_id == career.id]
        career_demand.append({
            "career_id": career.id,
            "career_title": career.title,
            "demand_score": round(career.demand_score * 100, 1),
            "application_count": len(career_jobs) * 5 + 10,  # Simulated
            "job_count": len(career_jobs)
        })

    return [
        {
            "metric_name": "career_demand",
            "metric_value": career_demand,
            "computed_at": datetime.now(timezone.utc)
        },
        {
            "metric_name": "total_users",
            "metric_value": {"value": 150, "trend": "up"},
            "computed_at": datetime.now(timezone.utc)
        },
        {
            "metric_name": "total_jobs",
            "metric_value": {"value": len(jobs), "trend": "up"},
            "computed_at": datetime.now(timezone.utc)
        },
        {
            "metric_name": "total_applications",
            "metric_value": {"value": len(jobs) * 3, "trend": "up"},
            "computed_at": datetime.now(timezone.utc)
        },
        {
            "metric_name": "sdg_distribution",
            "metric_value": {"7": 35, "12": 25, "13": 30, "8": 10},
            "computed_at": datetime.now(timezone.utc)
        },
    ]


# =============================================================================
# SEEDING FUNCTIONS
# =============================================================================

def seed_careers(db: Session) -> list[Career]:
    """Seed all careers."""
    careers_data = get_careers_data()
    careers = []

    for data in careers_data:
        career = Career(**data)
        db.add(career)
        careers.append(career)

    db.flush()  # Get IDs
    db.commit()
    print(f"✅ Seeded {len(careers)} careers")
    return careers


def seed_users(db: Session, admin_password: str) -> list[User]:
    """Seed all users."""
    users_data = get_users_data()
    users = []

    for data in users_data:
        if data.get("password_hash") is None and data.get("email") == "admin@greenmatchers.com":
            data["password_hash"] = get_password_hash(admin_password)
            del data["password_hash"]  # Rename to match model

        # Fix the password_hash field name
        if "password_hash" in data:
            data["password_hash"] = data["password_hash"]

        user = User(**data)
        db.add(user)
        users.append(user)

    db.flush()
    db.commit()
    print(f"✅ Seeded {len(users)} users")
    return users


def seed_jobs(db: Session, employers: list, careers: list) -> list[Job]:
    """Seed all jobs - at least one per career."""
    jobs_data = get_jobs_data(employers, careers)
    jobs = []

    for data in jobs_data:
        job = Job(**data)
        db.add(job)
        jobs.append(job)

    db.flush()
    db.commit()
    print(f"✅ Seeded {len(jobs)} jobs")
    return jobs


def seed_applications(db: Session, jobs: list, users: list) -> list[Application]:
    """Seed all applications - multiple per job."""
    apps_data = get_applications_data(jobs, users)
    applications = []

    for data in apps_data:
        application = Application(**data)
        db.add(application)
        applications.append(application)

    db.commit()
    print(f"✅ Seeded {len(applications)} applications")
    return applications


def seed_analytics(db: Session, careers: list, jobs: list) -> list[Analytics]:
    """Seed analytics metrics."""
    analytics_data = get_analytics_data(careers, jobs)
    metrics = []

    for data in analytics_data:
        metric = Analytics(**data)
        db.add(metric)
        metrics.append(metric)

    db.commit()
    print(f"✅ Seeded {len(metrics)} analytics metrics")
    return metrics


def seed_all():
    """Seed all tables for demo."""
    # Check environment
    env = os.getenv('ENVIRONMENT', 'development')
    if env == 'production':
        print("⚠️  Demo seeding disabled in production")
        print("   Use seed_production.py for production admin user only")
        return

    print(f"🌱 Starting database seeding... (ENV: {env})")

    # Initialize database
    init_db()
    db = SessionLocal()

    try:
        # Clear existing data (in reverse order of dependencies)
        print("🗑️  Clearing existing data...")
        db.query(Application).delete()
        db.query(Analytics).delete()
        db.query(Job).delete()
        db.query(Career).delete()
        db.query(User).delete()
        db.commit()

        # Get admin password
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
        if not os.getenv('ADMIN_PASSWORD'):
            print("⚠️  ADMIN_PASSWORD not set, using default 'admin123'")

        # Seed in dependency order
        print("\n📊 Seeding careers...")
        careers = seed_careers(db)

        print("\n👥 Seeding users...")
        users = seed_users(db, admin_password)

        print("\n💼 Seeding jobs...")
        employers = [u for u in users if u.role == UserRole.EMPLOYER]
        jobs = seed_jobs(db, employers, careers)

        print("\n📝 Seeding applications...")
        seed_applications(db, jobs, users)

        print("\n📈 Seeding analytics...")
        seed_analytics(db, careers, jobs)

        print("\n" + "=" * 50)
        print("✅ Database seeding complete!")
        print("=" * 50)
        print(f"   Careers: {len(careers)}")
        print(f"   Users: {len(users)} (including {len(employers)} employers)")
        print(f"   Jobs: {len(jobs)}")
        applications_count = db.query(Application).count()
        print(f"   Applications: {applications_count}")
        print("=" * 50)
        print("\nDemo credentials:")
        print("   Admin: admin@greenmatchers.com / ADMIN_PASSWORD")
        print("   Employer: employer@greenmatchers.com / employer123")
        print("   Job Seeker: jobseeker.solar@example.com / seeker123")
        print("=" * 50)

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
