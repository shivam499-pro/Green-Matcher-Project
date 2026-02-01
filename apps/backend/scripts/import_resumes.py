"""
apps/backend/scripts/import_resumes.py
Import resumes from JSON into database with AI embeddings
"""

from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer
import json
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.user import User
from utils.db import SessionLocal

# Initialize embedding model (same as your existing AI service)
model = SentenceTransformer('all-mpnet-base-v2')

def import_resumes_to_database(db: Session, resume_json_path: str):
    """
    Import resumes from JSON file into database
    Uses existing User model with skills JSON field
    """
    # Load resume data
    with open(resume_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    resumes_imported = 0
    
    for resume_data in data['resumes']:
        try:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == resume_data['email']).first()
            if existing_user:
                print(f"⏭️  Skipping {resume_data['name']} - already exists")
                continue
            
            # Prepare text for embedding (same as your existing AI service)
            skills_text = ", ".join(resume_data['skills'])
            experience_text = " ".join([
                f"{exp['title']} at {exp['company']}: {' '.join(exp['achievements'])}"
                for exp in resume_data['experience']
            ])
            
            full_text = f"{resume_data['summary']} {skills_text} {experience_text}"
            
            # Generate embedding using sentence-transformers
            embedding = model.encode(full_text)
            embedding_bytes = embedding.tobytes()
            
            # Create user using existing User model
            # Note: Using existing fields - skills (JSON), resume_url (String)
            user = User(
                email=resume_data['email'],
                password_hash='$2b$12$placeholder',  # Placeholder password
                full_name=resume_data['name'],
                role='USER',  # Set default role
                skills=resume_data['skills'],  # Store skills in JSON field
                resume_url=resume_data['name'].replace(' ', '_') + '.txt',  # Store resume filename
                language=resume_data['language'],  # Store preferred language
                saved_jobs=[]  # Empty saved jobs array
            )
            db.add(user)
            db.flush()  # Get user ID
            
            # Store additional resume data in a separate JSON file for reference
            resume_data_with_id = {
                'user_id': user.id,
                'summary': resume_data['summary'],
                'skills': resume_data['skills'],
                'experience': resume_data['experience'],
                'education': resume_data['education'],
                'certifications': resume_data['certifications'],
                'embedding': embedding.tolist()  # Convert to list for JSON storage
            }
            
            # Save to JSON file for reference
            resume_filename = f"resume_data_{user.id}.json"
            with open(resume_filename, 'w', encoding='utf-8') as f:
                json.dump(resume_data_with_id, f, indent=2, ensure_ascii=False)
            
            db.commit()
            resumes_imported += 1
            print(f"✅ Imported resume for {resume_data['name']} (ID: {user.id})")
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error importing {resume_data['name']}: {str(e)}")
            continue
    
    print(f"\n✅ Successfully imported {resumes_imported} resumes!")
    return resumes_imported

if __name__ == "__main__":
    # Import resumes
    db = SessionLocal()
    try:
        import_resumes_to_database(db, "resumes_database.json")
    finally:
        db.close()
