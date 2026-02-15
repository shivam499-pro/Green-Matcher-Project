"""
Green Matchers - Seed Data Script
Populates database with initial data for development.
"""
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from sqlalchemy.orm import Session
from apps.backend.db.session import engine
from apps.backend.models import user, career, job, application, analytics, saved_job, job_alert, notification, browse_history
from apps.backend.core.security import get_password_hash
from datetime import datetime, timezone
import json


def seed_users(session: Session):
    """Create sample users."""
    users = [
        user.User(
            email="admin@greenmatcher.ai",
            password_hash=get_password_hash("admin123"),
            full_name="Admin User",
            role=user.UserRole.ADMIN,
            is_verified=1,
            language="en"
        ),
        user.User(
            email="employer@greenmatcher.ai",
            password_hash=get_password_hash("employer123"),
            full_name="Green Energy Corp",
            role=user.UserRole.EMPLOYER,
            company_name="Green Energy Corp",
            company_description="Leading renewable energy company",
            company_website="https://greenenergy.example.com",
            is_verified=1,
            language="en"
        ),
        user.User(
            email="jobseeker@example.com",
            password_hash=get_password_hash("seeker123"),
            full_name="John Doe",
            role=user.UserRole.USER,
            skills=["Python", "SQL", "Data Analysis", "Machine Learning"],
            language="en"
        ),
    ]
    session.add_all(users)
    print("✅ Users seeded")


def seed_careers(session: Session):
    """Create sample green careers."""
    careers_list = [
        career.Career(
            title="Solar Energy Engineer",
            description="Design and develop solar energy systems for residential and commercial properties.",
            required_skills=["Engineering", "Solar Technology", "Electrical Systems", "Project Management"],
            sdg_tags=[7, 9, 13],  # Affordable Clean Energy, Industry Innovation, Climate Action
            avg_salary_min=500000,
            avg_salary_max=800000,
            avg_salary=650000,
            growth_potential="High",
            demand_score=0.85,
            is_active=True
        ),
        career.Career(
            title="Environmental Consultant",
            description="Advise organizations on environmental compliance and sustainability practices.",
            required_skills=["Environmental Science", "Regulatory Compliance", "Report Writing", "Client Management"],
            sdg_tags=[12, 13, 15],  # Responsible Consumption, Climate Action, Life on Land
            avg_salary_min=400000,
            avg_salary_max=700000,
            avg_salary=550000,
            growth_potential="High",
            demand_score=0.78,
            is_active=True
        ),
        career.Career(
            title="Wind Farm Technician",
            description="Install, maintain, and repair wind turbine equipment.",
            required_skills=["Electrical Systems", "Mechanical Systems", "Safety Protocols", "Physical Stamina"],
            sdg_tags=[7, 8, 13],  # Affordable Clean Energy, Decent Work, Climate Action
            avg_salary_min=350000,
            avg_salary_max=550000,
            avg_salary=450000,
            growth_potential="Medium",
            demand_score=0.72,
            is_active=True
        ),
        career.Career(
            title="Sustainability Manager",
            description="Lead corporate sustainability initiatives and environmental programs.",
            required_skills=["Strategic Planning", "Sustainability Reporting", "Stakeholder Management", "Data Analysis"],
            sdg_tags=[8, 12, 13],  # Decent Work, Responsible Consumption, Climate Action
            avg_salary_min=600000,
            avg_salary_max=1000000,
            avg_salary=800000,
            growth_potential="Very High",
            demand_score=0.88,
            is_active=True
        ),
        career.Career(
            title="Waste Management Specialist",
            description="Develop and implement waste reduction and recycling programs.",
            required_skills=["Waste Management", "Environmental Regulations", "Operations Management", "Public Education"],
            sdg_tags=[11, 12, 13],  # Sustainable Cities, Responsible Consumption, Climate Action
            avg_salary_min=350000,
            avg_salary_max=600000,
            avg_salary=475000,
            growth_potential="Medium",
            demand_score=0.65,
            is_active=True
        ),
        career.Career(
            title="Carbon Analyst",
            description="Analyze carbon footprints and develop reduction strategies for organizations.",
            required_skills=["Data Analysis", "Carbon Accounting", "Environmental Science", "Excel"],
            sdg_tags=[7, 13, 17],  # Affordable Clean Energy, Climate Action, Partnerships
            avg_salary_min=450000,
            avg_salary_max=750000,
            avg_salary=600000,
            growth_potential="Very High",
            demand_score=0.82,
            is_active=True
        ),
        career.Career(
            title="Electric Vehicle Engineer",
            description="Design and develop electric vehicle systems and components.",
            required_skills=["Electrical Engineering", "Battery Technology", " Automotive Systems", "CAD"],
            sdg_tags=[7, 9, 11, 13],  # Clean Energy, Innovation, Cities, Climate
            avg_salary_min=550000,
            avg_salary_max=900000,
            avg_salary=725000,
            growth_potential="Very High",
            demand_score=0.91,
            is_active=True
        ),
        career.Career(
            title="Water Conservation Specialist",
            description="Develop water management strategies for agriculture and urban areas.",
            required_skills=["Hydrology", "Water Management", "Environmental Engineering", "GIS"],
            sdg_tags=[6, 11, 13, 15],  # Clean Water, Cities, Climate, Life on Land
            avg_salary_min=400000,
            avg_salary_max=700000,
            avg_salary=550000,
            growth_potential="High",
            demand_score=0.75,
            is_active=True
        ),
    ]
    session.add_all(careers_list)
    print("✅ Careers seeded")


def seed_jobs(session: Session):
    """Create sample job postings."""
    # Get employer user
    employer = session.query(user.User).filter_by(email="employer@greenmatcher.ai").first()
    
    if not employer:
        print("⚠️ Employer not found, skipping jobs")
        return
        
    # Get careers
    careers_list = session.query(career.Career).all()
    
    jobs_list = [
        job.Job(
            employer_id=employer.id,
            career_id=careers_list[0].id if len(careers_list) > 0 else None,
            title="Senior Solar Engineer",
            description="We are looking for an experienced Solar Energy Engineer to join our team.",
            requirements="5+ years experience in solar energy projects\nBachelor's degree in Engineering\nRelevant certifications",
            job_type="full-time",
            required_skills=["Solar Technology", "Electrical Systems", "Project Management"],
            preferred_skills=["AutoCAD", "Python"],
            experience_level="senior",
            salary_min=600000,
            salary_max=900000,
            location="Bangalore, Karnataka",
            is_remote=False,
            sdg_tags=[7, 13],
            status=job.JobStatus.OPEN,
            is_verified=True,
            is_active=True
        ),
        job.Job(
            employer_id=employer.id,
            career_id=careers_list[1].id if len(careers_list) > 1 else None,
            title="Environmental Compliance Officer",
            description="Join our sustainability team to ensure environmental compliance.",
            requirements="3+ years in environmental compliance\nBachelor's in Environmental Science\nKnowledge of Indian environmental regulations",
            job_type="full-time",
            required_skills=["Environmental Compliance", "Regulatory Knowledge", "Report Writing"],
            preferred_skills=["ISO 14001", "NABL"],
            experience_level="mid",
            salary_min=500000,
            salary_max=700000,
            location="Mumbai, Maharashtra",
            is_remote=False,
            sdg_tags=[12, 13],
            status=job.JobStatus.OPEN,
            is_verified=True,
            is_active=True
        ),
        job.Job(
            employer_id=employer.id,
            career_id=careers_list[2].id if len(careers_list) > 2 else None,
            title="Wind Farm Maintenance Technician",
            description="Maintain and repair wind turbines at our wind farm.",
            requirements="2+ years experience with mechanical/electrical systems\nAbility to work at heights\nTechnical certification",
            job_type="full-time",
            required_skills=["Mechanical Systems", "Electrical Systems", "Safety Protocols"],
            preferred_skills=["Wind Turbine Experience", "SCADA"],
            experience_level="mid",
            salary_min=400000,
            salary_max=550000,
            location="Tamil Nadu",
            is_remote=False,
            sdg_tags=[7, 8],
            status=job.JobStatus.OPEN,
            is_verified=True,
            is_active=True
        ),
        job.Job(
            employer_id=employer.id,
            career_id=careers_list[3].id if len(careers_list) > 3 else None,
            title="Sustainability Manager - Remote",
            description="Lead our corporate sustainability initiatives.",
            requirements="7+ years experience in sustainability\nMBA or Master's in Sustainability\nStrong stakeholder management",
            job_type="full-time",
            required_skills=["Sustainability Strategy", "ESG Reporting", "Stakeholder Management"],
            preferred_skills=["GRI Standards", "Carbon Disclosure"],
            experience_level="senior",
            salary_min=800000,
            salary_max=1200000,
            location="Remote (India)",
            is_remote=True,
            sdg_tags=[8, 12, 13],
            status=job.JobStatus.OPEN,
            is_verified=True,
            is_active=True
        ),
    ]
    session.add_all(jobs_list)
    print("✅ Jobs seeded")


def seed_applications(session: Session):
    """Create sample job applications."""
    # Get job seeker and jobs
    jobseeker = session.query(user.User).filter_by(email="jobseeker@example.com").first()
    jobs_list = session.query(job.Job).all()
    
    if not jobseeker or not jobs_list:
        print("⚠️ Jobseeker or jobs not found, skipping applications")
        return
        
    applications_list = [
        application.Application(
            job_id=jobs_list[0].id if len(jobs_list) > 0 else None,
            user_id=jobseeker.id,
            status=application.ApplicationStatus.PENDING,
            cover_letter="I am excited to apply for this position. My experience in renewable energy aligns well with your requirements.",
            applied_at=datetime.now(timezone.utc)
        ),
        application.Application(
            job_id=jobs_list[1].id if len(jobs_list) > 1 else None,
            user_id=jobseeker.id,
            status=application.ApplicationStatus.REVIEWED,
            cover_letter="I have strong background in environmental compliance and would be a great fit.",
            applied_at=datetime.now(timezone.utc)
        ),
    ]
    session.add_all(applications_list)
    print("✅ Applications seeded")


def seed_analytics(session: Session):
    """Create sample analytics data."""
    # Analytics model has: id, metric_name, metric_value, computed_at
    analytics_list = [
        analytics.Analytics(
            metric_name="total_users",
            metric_value={"value": 150, "trend": "up"},
            computed_at=datetime.now(timezone.utc)
        ),
        analytics.Analytics(
            metric_name="active_users",
            metric_value={"value": 45, "trend": "stable"},
            computed_at=datetime.now(timezone.utc)
        ),
        analytics.Analytics(
            metric_name="total_jobs",
            metric_value={"value": 25, "trend": "up"},
            computed_at=datetime.now(timezone.utc)
        ),
        analytics.Analytics(
            metric_name="total_applications",
            metric_value={"value": 85, "trend": "up"},
            computed_at=datetime.now(timezone.utc)
        ),
        analytics.Analytics(
            metric_name="top_careers",
            metric_value=["Solar Energy Engineer", "Sustainability Manager", "EV Engineer"],
            computed_at=datetime.now(timezone.utc)
        ),
        analytics.Analytics(
            metric_name="top_skills",
            metric_value=["Python", "Data Analysis", "Project Management"],
            computed_at=datetime.now(timezone.utc)
        ),
        analytics.Analytics(
            metric_name="sdg_distribution",
            metric_value={"7": 35, "12": 25, "13": 30, "8": 10},
            computed_at=datetime.now(timezone.utc)
        ),
    ]
    session.add_all(analytics_list)
    print("✅ Analytics seeded")


def seed_saved_jobs(session: Session):
    """Create sample saved jobs."""
    jobseeker = session.query(user.User).filter_by(email="jobseeker@example.com").first()
    jobs_list = session.query(job.Job).limit(3).all()
    
    if not jobseeker or not jobs_list:
        print("⚠️ Jobseeker or jobs not found, skipping saved jobs")
        return
        
    for job_item in jobs_list:
        saved = saved_job.SavedJob(
            user_id=jobseeker.id,
            job_id=job_item.id,
            saved_at=datetime.now(timezone.utc)
        )
        session.add(saved)
    print("✅ Saved jobs seeded")


def seed_job_alerts(session: Session):
    """Create sample job alerts."""
    jobseeker = session.query(user.User).filter_by(email="jobseeker@example.com").first()
    
    if not jobseeker:
        print("⚠️ Jobseeker not found, skipping job alerts")
        return
        
    alerts_list = [
        job_alert.JobAlert(
            user_id=jobseeker.id,
            keywords="solar, renewable",
            location="Bangalore",
            job_type="full-time",
            sdg_tags=json.dumps([7, 13]),
            salary_min=500000,
            is_active=True,
            frequency="daily"
        ),
        job_alert.JobAlert(
            user_id=jobseeker.id,
            keywords="data analyst",
            location=None,
            job_type="full-time",
            sdg_tags=None,
            salary_min=400000,
            is_active=True,
            frequency="weekly"
        ),
    ]
    session.add_all(alerts_list)
    print("✅ Job alerts seeded")


def seed_notifications(session: Session):
    """Create sample notifications."""
    jobseeker = session.query(user.User).filter_by(email="jobseeker@example.com").first()
    
    if not jobseeker:
        print("⚠️ Jobseeker not found, skipping notifications")
        return
        
    notifications_list = [
        notification.Notification(
            user_id=jobseeker.id,
            title="New Job Match",
            message="A new job matching your profile: Senior Solar Engineer",
            notification_type="job_alert",
            is_read=False
        ),
        notification.Notification(
            user_id=jobseeker.id,
            title="Application Update",
            message="Your application for Environmental Compliance Officer has been reviewed",
            notification_type="application",
            is_read=False
        ),
        notification.Notification(
            user_id=jobseeker.id,
            title="Welcome to Green Matchers",
            message="Start exploring green career opportunities!",
            notification_type="system",
            is_read=True
        ),
    ]
    session.add_all(notifications_list)
    print("✅ Notifications seeded")


def seed_browse_history(session: Session):
    """Create sample browse history."""
    jobseeker = session.query(user.User).filter_by(email="jobseeker@example.com").first()
    jobs_list = session.query(job.Job).limit(5).all()
    
    if not jobseeker or not jobs_list:
        print("⚠️ Jobseeker or jobs not found, skipping browse history")
        return
        
    for idx, job_item in enumerate(jobs_list):
        history = browse_history.BrowseHistory(
            user_id=jobseeker.id,
            job_id=job_item.id,
            viewed_at=datetime.now(timezone.utc)
        )
        session.add(history)
    print("✅ Browse history seeded")


def seed_all():
    """Seed all data at once."""
    print("🌱 Starting database seeding...")
    
    with Session(engine) as session:
        try:
            seed_users(session)
            seed_careers(session)
            seed_jobs(session)
            seed_applications(session)
            seed_analytics(session)
            seed_saved_jobs(session)
            seed_job_alerts(session)
            seed_notifications(session)
            seed_browse_history(session)
            
            session.commit()
            print("✅ All seed data inserted successfully!")
        except Exception as e:
            session.rollback()
            print(f"❌ Error seeding data: {e}")
            raise


if __name__ == "__main__":
    seed_all()
