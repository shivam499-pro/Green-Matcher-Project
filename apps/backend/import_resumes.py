
"""
Use this code in your FastAPI backend to import the resumes
"""

from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer
import json

# Initialize embedding model
model = SentenceTransformer('all-mpnet-base-v2')

def import_resumes_to_database(db: Session, resume_json_path: str):
    """
    Import resumes from JSON file into database
    """
    # Load resume data
    with open(resume_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    resumes_imported = 0
    
    for resume_data in data['resumes']:
        try:
            # Create user
            user = User(
                email=resume_data['email'],
                phone=resume_data['phone'],
                full_name=resume_data['name'],
                location=resume_data['location'],
                preferred_language=resume_data['language'],
                experience_years=resume_data['experience_years']
            )
            db.add(user)
            db.flush()  # Get user ID
            
            # Prepare text for embedding
            skills_text = ", ".join(resume_data['skills'])
            experience_text = " ".join([
                f"{exp['title']} at {exp['company']}: {' '.join(exp['achievements'])}"
                for exp in resume_data['experience']
            ])
            
            full_text = f"{resume_data['summary']} {skills_text} {experience_text}"
            
            # Generate embedding
            embedding = model.encode(full_text)
            embedding_bytes = embedding.tobytes()
            
            # Create resume
            resume = Resume(
                user_id=user.id,
                summary_text=resume_data['summary'],
                skills_json=json.dumps(resume_data['skills']),
                experience_json=json.dumps(resume_data['experience']),
                education_json=json.dumps(resume_data['education']),
                certifications_json=json.dumps(resume_data['certifications']),
                embedding=embedding_bytes
            )
            db.add(resume)
            
            # Add individual skills
            for skill in resume_data['skills']:
                user_skill = UserSkill(
                    user_id=user.id,
                    skill_name=skill,
                    skill_category='technical'  # You can categorize this better
                )
                db.add(user_skill)
            
            db.commit()
            resumes_imported += 1
            print(f"✅ Imported resume for {resume_data['name']}")
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error importing {resume_data['name']}: {str(e)}")
            continue
    
    print(f"\n✅ Successfully imported {resumes_imported} resumes!")
    return resumes_imported

# Usage in your FastAPI endpoint or script:
# from database import SessionLocal
# db = SessionLocal()
# import_resumes_to_database(db, "resumes_database.json")
# db.close()
