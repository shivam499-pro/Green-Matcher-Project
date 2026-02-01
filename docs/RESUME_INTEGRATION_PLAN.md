# 📘 GREEN MATCHERS - RESUME INTEGRATION PLAN

## 📋 OVERVIEW

This document explains how to integrate the resume files into your existing Green Matchers architecture without breaking the design.

## 🎯 ARCHITECTURE ALIGNMENT

### Your Existing Architecture
```
Backend (FastAPI + Python 3.12)
├── Models (SQLAlchemy 2.0)
├── Services (AI: sentence-transformers, Google Translate)
├── Routes (API endpoints)
└── Database (MariaDB 10.11 with vector support)

Frontend (React 18 + Vite)
├── Components
├── Pages
├── Hooks
└── i18n (Multi-language support)
```

### Resume Files to Integrate
- ✅ `resumes_database.json` - 15 resumes with metadata
- ✅ `import_resumes.py` - Import script with AI embeddings
- ✅ `database_schema.sql` - Database schema (for reference)
- ✅ 15 JSON resume files (jsonresume_*.json)
- ✅ 14 TXT resume files (resume_*.txt)

## 🚀 INTEGRATION STRATEGY

### Phase 1: Database Setup (No Changes Needed)

**Good News:** Your existing User model already supports everything needed!

Your existing model in `apps/backend/models/`:
- [`User`](apps/backend/models/user.py) - Already has: email, phone, full_name, skills (JSON), resume_url, language

**Action:** No database schema changes needed! Your existing User model is compatible.

**Note:** Resume data (experience, education, certifications, embeddings) will be stored in separate JSON files for reference.

---

### Phase 2: Import Script Integration

**Location:** `apps/backend/scripts/import_resumes.py`

The import script needs to be integrated into your existing backend structure:

```python
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

from models.user import User, Resume, UserSkill
from utils.db import get_db

# Initialize embedding model (same as your existing AI service)
model = SentenceTransformer('all-mpnet-base-v2')

def import_resumes_to_database(db: Session, resume_json_path: str):
    """
    Import resumes from JSON file into database
    Uses existing models and AI embedding service
    """
    # Load resume data
    with open(resume_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    resumes_imported = 0
    
    for resume_data in data['resumes']:
        try:
            # Create user using existing User model
            user = User(
                email=resume_data['email'],
                phone=resume_data['phone'],
                full_name=resume_data['name'],
                location=resume_data['location'],
                preferred_language=resume_data['language'],
                experience_years=resume_data['experience_years'],
                role='USER',  # Set default role
                hashed_password='$2b$12$placeholder'  # Placeholder password
            )
            db.add(user)
            db.flush()  # Get user ID
            
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
            
            # Create resume using existing Resume model
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
            
            # Add individual skills using existing UserSkill model
            for skill in resume_data['skills']:
                user_skill = UserSkill(
                    user_id=user.id,
                    skill_name=skill,
                    skill_category='technical'
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

if __name__ == "__main__":
    # Import resumes
    from utils.db import SessionLocal
    db = SessionLocal()
    try:
        import_resumes_to_database(db, "resumes_database.json")
    finally:
        db.close()
```

---

### Phase 3: API Endpoint for Resume Import

**Location:** `apps/backend/routes/admin.py`

Add an admin endpoint to trigger resume import:

```python
@router.post("/import-resumes")
async def import_resumes(
    current_user: dict = Depends(get_current_user),
    db: DatabaseSession = Depends(get_db)
):
    """
    Import resumes from JSON file (Admin only)
    """
    if current_user.get('role') != 'ADMIN':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from scripts.import_resumes import import_resumes_to_database
    
    result = import_resumes_to_database(db, "resumes_database.json")
    
    return {
        "message": f"Successfully imported {result} resumes",
        "count": result
    }
```

---

### Phase 4: AI Features Integration

Your existing AI services already support everything needed!

#### 4.1 Semantic Search (Already Implemented)

Your existing [`EmbeddingService`](apps/backend/services/ai/embeddings.py) already:
- Uses `sentence-transformers` with `all-mpnet-base-v2`
- Generates 768-dim embeddings
- Stores in MariaDB as BLOB

**No changes needed!** The imported resumes will work with your existing semantic search.

#### 4.2 Skill Matching (Already Implemented)

Your existing [`MatchingService`](apps/backend/services/ai/matching.py) already:
- Matches user skills to careers
- Matches user skills to jobs
- Uses cosine similarity

**No changes needed!** The imported resumes will work with your existing skill matching.

#### 4.3 Resume Parsing (Already Implemented)

Your existing resume parsing already:
- Extracts skills from resume text
- Stores in JSON format
- Creates UserSkill records

**No changes needed!** The import script uses the same approach.

#### 4.4 Translation (Already Implemented)

Your existing [`TranslationService`](apps/backend/services/ai/translation.py) already:
- Uses Google Translate API
- Supports multiple languages
- Translates job titles, descriptions, recommendations

**No changes needed!** The imported resumes will work with your existing translation.

---

## 📝 STEP-BY-STEP EXECUTION PLAN

### Step 1: Move Files to Correct Locations

```powershell
# Move resume JSON file to backend
move "C:\Green-Matcher-Project\apps\resumes_database.json" "C:\Green-Matcher-Project\apps\backend\resumes_database.json"

# Move import script to backend scripts folder
move "C:\Green-Matcher-Project\apps\import_resumes.py" "C:\Green-Matcher-Project\apps\backend\scripts\import_resumes.py"

# Move other documentation files to docs folder
move "C:\Green-Matcher-Project\apps\*.md" "C:\Green-Matcher-Project\docs\"
move "C:\Green-Matcher-Project\apps\*.txt" "C:\Green-Matcher-Project\docs\"
```

### Step 2: Update Import Script

Update `apps/backend/scripts/import_resumes.py` with the code provided in Phase 2 above.

### Step 3: Run Import Script

```powershell
cd apps\backend
python scripts\import_resumes.py
```

### Step 4: Verify Import

```sql
-- Check database
SELECT COUNT(*) FROM users;  -- Should show 15
SELECT COUNT(*) FROM resumes;  -- Should show 15
SELECT COUNT(*) FROM user_skills;  -- Should show 90+ skills

-- Check language distribution
SELECT preferred_language, COUNT(*) 
FROM users 
GROUP BY preferred_language;

-- Check experience distribution
SELECT 
    CASE 
        WHEN experience_years = 0 THEN 'Fresher'
        WHEN experience_years <= 2 THEN 'Entry-Level'
        WHEN experience_years <= 7 THEN 'Mid-Level'
        ELSE 'Senior'
    END as level,
    COUNT(*) as count
FROM users
GROUP BY level;
```

### Step 5: Test AI Features

#### Test Semantic Search
```bash
# Search for solar technician
curl "http://localhost:8000/api/jobs/search?query=solar+technician"

# Search in Hindi
curl "http://localhost:8000/api/jobs/search?query=सौर+पैनल&language=hi"
```

#### Test Skill Matching
```bash
# Get career recommendations for a user
curl "http://localhost:8000/api/users/me/recommendations" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get job recommendations for a user
curl "http://localhost:8000/api/users/me/job-recommendations" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Test Translation
```bash
# Get resume in Tamil
curl "http://localhost:8000/api/resumes/1?language=ta" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 DEMO SCENARIOS

### Scenario 1: Semantic Search Demo
1. Go to Job Search page
2. Search for "solar technician"
3. Show results with similarity scores
4. Switch to Hindi and search "सौर पैनल लगाने का काम"
5. Show same results in Hindi

### Scenario 2: Skill Matching Demo
1. Login as a job seeker (one of the imported users)
2. Go to Recommendations page
3. Show AI-powered career recommendations
4. Show AI-powered job recommendations
5. Display similarity scores

### Scenario 3: Multi-language Demo
1. Load a resume (e.g., Rajesh Kumar - Hindi speaker)
2. Show resume in English
3. Switch to Tamil - show translated resume
4. Switch to Hindi - show original resume
5. Switch to Telugu - show translated resume

### Scenario 4: Analytics Demo
1. Go to Analytics page
2. Show career demand scores
3. Show skill popularity
4. Show salary ranges
5. Show SDG distribution

---

## 🔧 FILES TO CREATE/MODIFY

### Files to Create
1. `apps/backend/scripts/import_resumes.py` - Import script
2. `apps/backend/routes/admin.py` - Admin routes (if not exists)

### Files to Modify
1. `apps/backend/routes/admin.py` - Add `/import-resumes` endpoint
2. `apps/backend/main.py` - Register admin router (if not already)

### Files to Move
1. `resumes_database.json` → `apps/backend/resumes_database.json`
2. `import_resumes.py` → `apps/backend/scripts/import_resumes.py`
3. `*.md` files → `docs/`
4. `*.txt` files → `docs/`

---

## ✅ CHECKLIST

- [ ] Move `resumes_database.json` to `apps/backend/`
- [ ] Create `apps/backend/scripts/` directory
- [ ] Move `import_resumes.py` to `apps/backend/scripts/`
- [ ] Update import script with correct imports
- [ ] Run import script
- [ ] Verify database has 15 users, 15 resumes, 90+ skills
- [ ] Test semantic search
- [ ] Test skill matching
- [ ] Test translation
- [ ] Test analytics
- [ ] Prepare demo scenarios

---

## 🎉 BENEFITS

1. **No Architecture Changes:** Uses existing models and services
2. **AI-Ready:** Resumes come with pre-generated embeddings
3. **Multi-language:** Supports 8 Indian languages
4. **Demo-Ready:** 15 diverse resumes for hackathon demo
5. **Scalable:** Easy to add more resumes later

---

## 📚 ADDITIONAL RESOURCES

- [`apps/backend/services/ai/embeddings.py`](apps/backend/services/ai/embeddings.py) - Embedding service
- [`apps/backend/services/ai/matching.py`](apps/backend/services/ai/matching.py) - Matching service
- [`apps/backend/services/ai/translation.py`](apps/backend/services/ai/translation.py) - Translation service
- [`apps/backend/models/user.py`](apps/backend/models/user.py) - User, Resume, UserSkill models
- [`apps/backend/routes/users.py`](apps/backend/routes/users.py) - User routes

---

## 🚀 NEXT STEPS

1. Move files to correct locations
2. Update import script
3. Run import script
4. Test all AI features
5. Prepare demo scenarios
6. Ready for hackathon! 🎯
