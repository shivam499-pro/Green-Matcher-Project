"""
Green Matchers - Production Database Seeding
"""
import os
import sys
from sqlalchemy.orm import Session
from models.user import User
from models.job import Job
from models.career import Career
from models.application import Application
from models.analytics import Analytics
from core.security import get_password_hash
from utils.db import SessionLocal

def seed_production_database():
    """Seed production database with initial data."""
    db = SessionLocal()
    
    try:
        # Create admin user only
        admin_password = os.getenv('ADMIN_PASSWORD')
        if not admin_password:
            print("ERROR: ADMIN_PASSWORD environment variable not set")
            sys.exit(1)
        
        admin = User(
            email="admin@greenmatchers.com",
            password_hash=get_password_hash(admin_password),
            full_name="System Administrator",
            role="ADMIN",
            skills=[],
            saved_jobs=[]
        )
        db.add(admin)
        db.commit()
        
        print("✅ Production database seeded successfully")
        print(f"   Admin: admin@greenmatchers.com")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_production_database()
