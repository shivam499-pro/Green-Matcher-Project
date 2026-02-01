"""
Green Matchers - Database Seeding Script
Populates database with demo data for hackathon demo.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from utils.db import engine, SessionLocal, init_db
from models.user import User
from models.job import Job
from models.career import Career
from models.application import Application
from models.analytics import Analytics
from core.security import get_password_hash
from datetime import datetime, timedelta
import json


def seed_careers(db: Session):
    """Seed careers table with green career paths."""
    careers_data = [
        {
            "title": "Solar Energy Technician",
            "description": "Install, maintain, and repair solar panel systems for residential and commercial properties.",
            "required_skills": ["solar installation", "electrical systems", "maintenance", "safety protocols"],
            "sdg_tags": [7, 8, 13],
            "avg_salary_min": 400000,
            "avg_salary_max": 500000
        },
        {
            "title": "Wind Turbine Technician",
            "description": "Maintain and repair wind turbine systems for renewable energy generation.",
            "required_skills": ["wind energy", "mechanical systems", "electrical maintenance", "height safety"],
            "sdg_tags": [7, 8, 13],
            "avg_salary_min": 450000,
            "avg_salary_max": 550000
        },
        {
            "title": "Sustainable Agriculture Specialist",
            "description": "Implement eco-friendly farming practices and sustainable crop management.",
            "required_skills": ["organic farming", "soil health", "crop rotation", "water conservation"],
            "sdg_tags": [2, 12, 13, 15],
            "avg_salary_min": 300000,
            "avg_salary_max": 400000
        },
        {
            "title": "Waste Management Engineer",
            "description": "Design and implement waste reduction and recycling systems.",
            "required_skills": ["waste management", "recycling processes", "environmental compliance", "process optimization"],
            "sdg_tags": [11, 12, 13],
            "avg_salary_min": 350000,
            "avg_salary_max": 450000
        },
        {
            "title": "Environmental Consultant",
            "description": "Advise businesses on environmental impact and sustainability practices.",
            "required_skills": ["environmental assessment", "sustainability reporting", "regulatory compliance", "data analysis"],
            "sdg_tags": [12, 13, 17],
            "avg_salary_min": 500000,
            "avg_salary_max": 700000
        },
        {
            "title": "Green Building Architect",
            "description": "Design sustainable buildings with minimal environmental impact.",
            "required_skills": ["sustainable design", "LEED certification", "energy efficiency", "green materials"],
            "sdg_tags": [11, 12, 13],
            "avg_salary_min": 600000,
            "avg_salary_max": 800000
        },
        {
            "title": "Water Resource Manager",
            "description": "Manage and conserve water resources for communities and industries.",
            "required_skills": ["water management", "conservation techniques", "quality testing", "infrastructure planning"],
            "sdg_tags": [6, 13, 14],
            "avg_salary_min": 380000,
            "avg_salary_max": 460000
        },
        {
            "title": "Electric Vehicle Technician",
            "description": "Maintain and repair electric vehicles and charging infrastructure.",
            "required_skills": ["EV systems", "electrical diagnostics", "battery technology", "charging infrastructure"],
            "sdg_tags": [7, 9, 13],
            "avg_salary_min": 420000,
            "avg_salary_max": 540000
        },
        {
            "title": "Carbon Footprint Analyst",
            "description": "Measure and analyze carbon emissions for organizations.",
            "required_skills": ["carbon accounting", "data analysis", "environmental science", "reporting"],
            "sdg_tags": [13, 17],
            "avg_salary_min": 480000,
            "avg_salary_max": 620000
        },
        {
            "title": "Renewable Energy Project Manager",
            "description": "Oversee renewable energy projects from planning to completion.",
            "required_skills": ["project management", "renewable energy", "budget management", "team leadership"],
            "sdg_tags": [7, 8, 13],
            "avg_salary_min": 700000,
            "avg_salary_max": 900000
        }
    ]
    
    for career_data in careers_data:
        career = Career(**career_data)
        db.add(career)
    
    db.commit()
    print(f"✅ Seeded {len(careers_data)} careers")
    
def seed_users(db: Session):
    """Seed users table with demo users."""
    users_data = [
        {
            "email": "jobseeker1@example.com",
            "full_name": "Rajesh Kumar",
            "password_hash": get_password_hash("password123"),
            "role": "USER",
            "language": "hi",
            "skills": ["solar installation", "electrical systems", "maintenance"]
        },
        {
            "email": "jobseeker2@example.com",
            "full_name": "Priya Sharma",
            "password_hash": get_password_hash("password123"),
            "role": "USER",
            "language": "ta",
            "skills": ["organic farming", "soil health", "crop rotation"]
        },
        {
            "email": "jobseeker3@example.com",
            "full_name": "Amit Patel",
            "password_hash": get_password_hash("password123"),
            "role": "USER",
            "language": "te",
            "skills": ["wind energy", "mechanical systems"]
        },
        {
            "email": "employer1@example.com",
            "full_name": "Green Energy Corp",
            "password_hash": get_password_hash("password123"),
            "role": "EMPLOYER",
            "language": "en",
            "company_name": "Green Energy Corporation"
        },
        {
            "email": "employer2@example.com",
            "full_name": "Sustainable Solutions Ltd",
            "password_hash": get_password_hash("password123"),
            "role": "EMPLOYER",
            "language": "en",
            "company_name": "Sustainable Solutions Limited"
        },
        {
            "email": "admin@example.com",
            "full_name": "System Admin",
            "password_hash": get_password_hash("admin123"),
            "role": "ADMIN",
            "language": "en"
        }
    ]
    
    for user_data in users_data:
        user = User(**user_data)
        db.add(user)
    
    db.commit()
    print(f"✅ Seeded {len(users_data)} users")
    
def seed_jobs(db: Session):
    """Seed jobs table with demo jobs."""
    # Get employers
    employers = db.query(User).filter(User.role == "EMPLOYER").all()
    
    # Get careers
    careers = db.query(Career).all()
    
    if not employers or not careers:
        print("⚠️  No employers or careers found. Please seed users and careers first.")
        return
    
    jobs_data = [
        {
            "employer_id": employers[0].id,
            "career_id": careers[0].id,
            "title": "Solar Panel Installation Technician",
            "description": "Looking for experienced solar technicians to install residential and commercial solar systems. Must have 2+ years experience.",
            "requirements": "2+ years experience, certification preferred, willing to travel.",
            "salary_min": 350000,
            "salary_max": 550000,
            "location": "Mumbai, Maharashtra",
            "sdg_tags": [7, 8, 13],
            "is_verified": True
        },
        {
            "employer_id": employers[0].id,
            "career_id": careers[1].id,
            "title": "Wind Farm Maintenance Engineer",
            "description": "Join our team maintaining wind turbines in Gujarat. Competitive salary and benefits.",
            "requirements": "Engineering degree, 3+ years experience, mechanical background.",
            "salary_min": 450000,
            "salary_max": 650000,
            "location": "Gandhinagar, Gujarat",
            "sdg_tags": [7, 8, 13],
            "is_verified": True
        },
        {
            "employer_id": employers[1].id,
            "career_id": careers[2].id,
            "title": "Organic Farming Consultant",
            "description": "Help farmers transition to sustainable organic practices. Field work required.",
            "requirements": "Agriculture background, knowledge of organic practices, field experience.",
            "salary_min": 300000,
            "salary_max": 450000,
            "location": "Bangalore, Karnataka",
            "sdg_tags": [2, 12, 13, 15],
            "is_verified": True
        },
        {
            "employer_id": employers[1].id,
            "career_id": careers[3].id,
            "title": "Waste Management Specialist",
            "description": "Lead our waste reduction and recycling initiatives in Chennai.",
            "requirements": "Environmental engineering degree, 2+ years experience, process knowledge.",
            "salary_min": 380000,
            "salary_max": 520000,
            "location": "Chennai, Tamil Nadu",
            "sdg_tags": [11, 12, 13],
            "is_verified": True
        },
        {
            "employer_id": employers[0].id,
            "career_id": careers[4].id,
            "title": "Sustainability Analyst",
            "description": "Analyze environmental impact and recommend improvements for corporate clients.",
            "requirements": "Environmental science degree, data analysis skills, consulting experience.",
            "salary_min": 500000,
            "salary_max": 750000,
            "location": "Delhi NCR",
            "sdg_tags": [12, 13, 17],
            "is_verified": True
        },
        {
            "employer_id": employers[0].id,
            "career_id": careers[5].id,
            "title": "Green Building Designer",
            "description": "Design LEED-certified buildings with minimal carbon footprint.",
            "requirements": "Architecture degree, LEED certification, 5+ years experience.",
            "salary_min": 600000,
            "salary_max": 900000,
            "location": "Pune, Maharashtra",
            "sdg_tags": [11, 12, 13],
            "is_verified": True
        },
        {
            "employer_id": employers[1].id,
            "career_id": careers[6].id,
            "title": "Water Conservation Engineer",
            "description": "Design and implement water conservation systems for urban areas.",
            "requirements": "Civil/environmental engineering, water management knowledge, 3+ years experience.",
            "salary_min": 400000,
            "salary_max": 580000,
            "location": "Hyderabad, Telangana",
            "sdg_tags": [6, 13, 14],
            "is_verified": True
        },
        {
            "employer_id": employers[0].id,
            "career_id": careers[7].id,
            "title": "EV Charging Station Technician",
            "description": "Install and maintain electric vehicle charging infrastructure across Maharashtra.",
            "requirements": "Electrical certification, EV systems knowledge, 2+ years experience.",
            "salary_min": 420000,
            "salary_max": 580000,
            "location": "Mumbai, Maharashtra",
            "sdg_tags": [7, 9, 13],
            "is_verified": True
        },
        {
            "employer_id": employers[1].id,
            "career_id": careers[8].id,
            "title": "Carbon Accounting Specialist",
            "description": "Measure and report carbon emissions for manufacturing clients.",
            "requirements": "Environmental science, carbon accounting certification, 4+ years experience.",
            "salary_min": 480000,
            "salary_max": 680000,
            "location": "Bangalore, Karnataka",
            "sdg_tags": [13, 17],
            "is_verified": True
        }
    ]
    
    for job_data in jobs_data:
        job = Job(**job_data)
        db.add(job)
    
    db.commit()
    print(f"✅ Seeded {len(jobs_data)} jobs")
    
def seed_applications(db: Session):
    """Seed applications table with demo applications."""
    # Get job seekers and jobs
    job_seekers = db.query(User).filter(User.role == "USER").all()
    jobs = db.query(Job).limit(5).all()
    
    if not job_seekers or not jobs:
        print("⚠️  No job seekers or jobs found. Please seed users and jobs first.")
        return
    
    applications_data = []
    for i, job in enumerate(jobs):
        # Create applications from different job seekers
        applicant = job_seekers[i % len(job_seekers)]
        application = {
            "job_id": job.id,
            "user_id": applicant.id,
            "status": "PENDING" if i % 2 == 0 else ("ACCEPTED" if i % 2 == 1 else "REJECTED"),
            "cover_letter": f"I am very interested in this position at {job.title}. My skills align well with the requirements."
        }
        applications_data.append(application)
    
    for app_data in applications_data:
        application = Application(**app_data)
        db.add(application)
    
    db.commit()
    print(f"✅ Seeded {len(applications_data)} applications")
    
def seed_analytics(db: Session):
    """Seed analytics table with pre-computed metrics."""
    analytics_data = [
        {
            "metric_name": "career_demand",
            "metric_value": [
                {"career_id": 1, "career_title": "Solar Energy Technician", "demand_score": 85.5, "application_count": 12, "job_count": 3},
                {"career_id": 2, "career_title": "Wind Turbine Technician", "demand_score": 78.2, "application_count": 8, "job_count": 2},
                {"career_id": 3, "career_title": "Sustainable Agriculture Specialist", "demand_score": 92.1, "application_count": 15, "job_count": 2},
                {"career_id": 4, "career_title": "Waste Management Engineer", "demand_score": 81.3, "application_count": 10, "job_count": 2},
                {"career_id": 5, "career_title": "Environmental Consultant", "demand_score": 88.7, "application_count": 11, "job_count": 1}
            ]
        },
        {
            "metric_name": "skill_popularity",
            "metric_value": [
                {"skill": "solar installation", "count": 8, "trend": "up"},
                {"skill": "electrical systems", "count": 6, "trend": "stable"},
                {"skill": "organic farming", "count": 7, "trend": "up"},
                {"skill": "wind energy", "count": 5, "trend": "up"},
                {"skill": "waste management", "count": 4, "trend": "stable"},
                {"skill": "environmental assessment", "count": 6, "trend": "up"},
                {"skill": "sustainable design", "count": 3, "trend": "stable"},
                {"skill": "water management", "count": 4, "trend": "up"},
                {"skill": "EV systems", "count": 3, "trend": "up"},
                {"skill": "carbon accounting", "count": 2, "trend": "stable"}
            ]
        },
        {
            "metric_name": "salary_ranges",
            "metric_value": [
                {"career_id": 1, "career_title": "Solar Energy Technician", "min_salary": 350000, "max_salary": 550000, "avg_salary": 450000, "job_count": 3},
                {"career_id": 2, "career_title": "Wind Turbine Technician", "min_salary": 450000, "max_salary": 650000, "avg_salary": 550000, "job_count": 2},
                {"career_id": 3, "career_title": "Sustainable Agriculture Specialist", "min_salary": 300000, "max_salary": 450000, "avg_salary": 375000, "job_count": 2},
                {"career_id": 4, "career_title": "Waste Management Engineer", "min_salary": 380000, "max_salary": 520000, "avg_salary": 450000, "job_count": 2},
                {"career_id": 5, "career_title": "Environmental Consultant", "min_salary": 500000, "max_salary": 750000, "avg_salary": 625000, "job_count": 1}
            ]
        },
        {
            "metric_name": "sdg_distribution",
            "metric_value": [
                {"sdg_goal": 7, "count": 4, "percentage": 40.0},
                {"sdg_goal": 13, "count": 10, "percentage": 100.0},
                {"sdg_goal": 12, "count": 6, "percentage": 60.0},
                {"sdg_goal": 8, "count": 2, "percentage": 20.0},
                {"sdg_goal": 11, "count": 3, "percentage": 30.0},
                {"sdg_goal": 6, "count": 1, "percentage": 10.0},
                {"sdg_goal": 15, "count": 1, "percentage": 10.0},
                {"sdg_goal": 9, "count": 1, "percentage": 10.0},
                {"sdg_goal": 14, "count": 1, "percentage": 10.0},
                {"sdg_goal": 17, "count": 2, "percentage": 20.0}
            ]
        }
    ]
    
    for metric_data in analytics_data:
        metric = Analytics(**metric_data)
        db.add(metric)
    
    db.commit()
    print(f"✅ Seeded {len(analytics_data)} analytics metrics")
    
def seed_all():
    """Seed all tables with demo data."""
    # Check if running in production
    if os.getenv('ENVIRONMENT') == 'production':
        print("⚠️  Demo seeding disabled in production")
        print("   Use seed_production.py instead")
        return
    
    print("🌱 Starting database seeding for Green Matchers demo...")
    print("=" * 50)
    
    # Create database tables first
    print("🔨 Creating database tables...")
    init_db()
    print("✅ Database tables created")
    
    db = SessionLocal()
    
    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
        print("🗑️  Clearing existing data...")
        db.query(Application).delete()
        db.query(Job).delete()
        db.query(Career).delete()
        db.query(User).delete()
        db.query(Analytics).delete()
        db.commit()
        
        # Seed in order of dependencies
        print("\n📊 Seeding careers...")
        seed_careers(db)
        
        print("\n👥 Seeding users...")
        seed_users(db)
        
        print("\n💼 Seeding jobs...")
        seed_jobs(db)
        
        print("\n📝 Seeding applications...")
        seed_applications(db)
        
        print("\n📈 Seeding analytics...")
        seed_analytics(db)
        
        print("\n" + "=" * 50)
        print("✅ Database seeding completed successfully!")
        print("\n📋 Demo Credentials:")
        print("   Job Seeker 1: jobseeker1@example.com / password123")
        print("   Job Seeker 2: jobseeker2@example.com / password123")
        print("   Job Seeker 3: jobseeker3@example.com / password123")
        print("   Employer 1:   employer1@example.com / password123")
        print("   Employer 2:   employer2@example.com / password123")
        print("   Admin:        admin@example.com / admin123")
        print("\n🚀 Ready for demo!")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()
    
if __name__ == "__main__":
    seed_all()
