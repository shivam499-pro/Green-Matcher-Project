# 🤖 GREEN MATCHERS - AI FEATURES GUIDE

## 📋 OVERVIEW

This guide explains how the AI features work with the imported resumes in your Green Matchers platform.

## 🎯 AI ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     GREEN MATCHERS AI                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │    │   Database   │  │
│  │   (React)    │◄──►│   (FastAPI)  │◄──►│  (MariaDB)   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │            │
│         │                   ▼                   │            │
│         │         ┌─────────────────┐          │            │
│         │         │   AI Services    │          │            │
│         │         ├─────────────────┤          │            │
│         │         │ • Embeddings    │          │            │
│         │         │ • Matching      │          │            │
│         │         │ • Translation   │          │            │
│         │         └─────────────────┘          │            │
│         │                   │                   │            │
│         ▼                   ▼                   ▼            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   i18n       │    │   sentence-  │    │   Vector     │  │
│  │   (i18next)  │    │   transformers│    │   Columns   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🧠 AI FEATURE 1: SEMANTIC SEARCH

### How It Works

1. **Text Processing**
   - User enters search query (e.g., "solar technician")
   - Query is processed and cleaned

2. **Embedding Generation**
   - Query is converted to 768-dim vector using `sentence-transformers`
   - Model: `all-mpnet-base-v2`
   - Same model used for all text (jobs, careers, resumes)

3. **Vector Search**
   - Query vector is compared to all job/career vectors
   - Cosine similarity calculated
   - Results ranked by similarity score

4. **Results Display**
   - Top results returned with similarity scores
   - Results can be filtered by language, SDG, location

### Code Flow

```python
# User searches for "solar technician"
query = "solar technician"

# Generate embedding
query_embedding = embedding_service.encode(query)

# Search in database
results = db.query(Job).all()
for job in results:
    job_embedding = np.frombuffer(job.embedding, dtype=np.float32)
    similarity = cosine_similarity(query_embedding, job_embedding)
    
# Return top results
return sorted(results, key=lambda x: x.similarity, reverse=True)[:10]
```

### With Imported Resumes

The imported resumes already have embeddings generated:
- Each resume has a 768-dim vector stored in `resumes.embedding`
- This enables semantic search across resumes
- Employers can search for candidates using natural language

### Demo Scenario

**Search:** "solar panel installation experience"

**Results:**
1. Rajesh Kumar Sharma (Score: 0.92) - Solar Installation Technician
2. Neha Agarwal (Score: 0.87) - Solar Sales Representative
3. Ananya Chatterjee (Score: 0.84) - Wind Energy Engineer

---

## 🎯 AI FEATURE 2: SKILL MATCHING

### How It Works

1. **User Skills Extraction**
   - User enters skills (text-based)
   - Skills are stored in `user_skills` table
   - Each skill has a category (technical, soft, domain)

2. **Career Matching**
   - User skills are converted to embedding
   - Compared to all career embeddings
   - Top careers recommended with similarity scores

3. **Job Matching**
   - User skills embedding compared to job embeddings
   - Top jobs recommended with similarity scores
   - Results filtered by user preferences (location, salary)

### Code Flow

```python
# User has skills: ["solar panel installation", "electrical wiring"]
user_skills = ["solar panel installation", "electrical wiring"]

# Generate embedding
skills_text = ", ".join(user_skills)
user_embedding = embedding_service.encode(skills_text)

# Match to careers
careers = db.query(Career).all()
for career in careers:
    career_embedding = np.frombuffer(career.embedding, dtype=np.float32)
    similarity = cosine_similarity(user_embedding, career_embedding)
    
# Return top careers
return sorted(careers, key=lambda x: x.similarity, reverse=True)[:10]
```

### With Imported Resumes

The imported resumes have skills extracted:
- Each resume has 6-8 skills stored in `user_skills` table
- Skills are categorized (technical, soft, domain)
- Enables skill-based matching for recommendations

### Demo Scenario

**User Skills:** ["solar panel installation", "electrical wiring", "safety compliance"]

**Career Recommendations:**
1. Solar Installation Technician (Score: 0.94)
2. Electrical Engineer (Score: 0.89)
3. Renewable Energy Technician (Score: 0.87)

**Job Recommendations:**
1. Solar Panel Installer at SunPower India (Score: 0.92)
2. Electrical Technician at Green Energy Corp (Score: 0.88)
3. Solar Maintenance Engineer at SolarTech (Score: 0.85)

---

## 🌐 AI FEATURE 3: MULTI-LANGUAGE TRANSLATION

### How It Works

1. **Language Detection**
   - User's preferred language is stored in `users.preferred_language`
   - Frontend uses i18next for UI translations
   - Backend uses Google Translate API for content translation

2. **Translation Process**
   - Content is translated on-demand
   - Translations are cached for performance
   - Fallback to English if translation fails

3. **Supported Languages**
   - English (en)
   - Hindi (hi)
   - Tamil (ta)
   - Telugu (te)
   - Bengali (bn)
   - Marathi (mr)
   - Kannada (kn)
   - Punjabi (pa)

### Code Flow

```python
# User requests job in Tamil
job_id = 1
target_language = "ta"

# Get job
job = db.query(Job).filter(Job.id == job_id).first()

# Translate if needed
if target_language != "en":
    translated_title = translation_service.translate(
        job.title, 
        source="en", 
        target=target_language
    )
    translated_description = translation_service.translate(
        job.description, 
        source="en", 
        target=target_language
    )
else:
    translated_title = job.title
    translated_description = job.description

# Return translated job
return {
    "id": job.id,
    "title": translated_title,
    "description": translated_description,
    ...
}
```

### With Imported Resumes

The imported resumes support 8 languages:
- 3 Hindi speakers
- 2 Tamil speakers
- 3 English speakers
- 2 Telugu speakers
- 1 Bengali speaker
- 2 Marathi speakers
- 1 Kannada speaker
- 1 Punjabi speaker

### Demo Scenario

**Original Resume (English):**
"5 years of experience in solar panel installation and maintenance. Skilled in rooftop and ground-mounted solar systems."

**Translated to Hindi:**
"सौर पैनल स्थापना और रखरखाव में 5 वर्ष का अनुभव। छत और जमीन पर स्थापित सौर प्रणालियों में कुशल।"

**Translated to Tamil:**
"சூரிய பேனல் நிறுவல் மற்றும் பராமரிப்பில் 5 ஆண்டுகள் அனுபவம். கூரை மற்றும் தரையில் நிறுவப்பட்ட சூரிய அமைப்புகளில் தேர்ச்சி பெற்றவர்."

---

## 📄 AI FEATURE 4: RESUME PARSING

### How It Works

1. **Resume Upload**
   - User uploads resume (PDF, TXT, JSON)
   - Resume text is extracted

2. **Skill Extraction**
   - NLP techniques extract skills from resume
   - Rule-based extraction for common patterns
   - Skills are stored in `user_skills` table

3. **Experience Extraction**
   - Work experience is parsed
   - Job titles, companies, durations extracted
   - Stored in `resumes.experience_json`

4. **Education Extraction**
   - Education details parsed
   - Degrees, institutions, years extracted
   - Stored in `resumes.education_json`

### Code Flow

```python
# User uploads resume
resume_text = extract_text_from_pdf(resume_file)

# Extract skills using NLP
skills = nlp_service.extract_skills(resume_text)

# Extract experience
experience = nlp_service.extract_experience(resume_text)

# Extract education
education = nlp_service.extract_education(resume_text)

# Generate embedding
full_text = f"{resume_text} {', '.join(skills)}"
embedding = embedding_service.encode(full_text)

# Store in database
resume = Resume(
    user_id=user.id,
    summary_text=resume_text,
    skills_json=json.dumps(skills),
    experience_json=json.dumps(experience),
    education_json=json.dumps(education),
    embedding=embedding.tobytes()
)
db.add(resume)

# Store individual skills
for skill in skills:
    user_skill = UserSkill(
        user_id=user.id,
        skill_name=skill,
        skill_category="technical"
    )
    db.add(user_skill)
```

### With Imported Resumes

The imported resumes have all data pre-extracted:
- Skills extracted and stored in `user_skills` table
- Experience stored in `resumes.experience_json`
- Education stored in `resumes.education_json`
- Certifications stored in `resumes.certifications_json`
- Embeddings pre-generated and stored in `resumes.embedding`

### Demo Scenario

**Resume:** Rajesh Kumar Sharma

**Extracted Skills:**
- Solar panel installation
- Photovoltaic system maintenance
- Electrical wiring
- Safety compliance
- Troubleshooting and repair
- Customer service
- Team leadership

**Extracted Experience:**
- Solar Installation Technician at SunPower India (2019-Present)
- Electrical Apprentice at Power Grid Corp (2017-2019)

**Extracted Education:**
- ITI Electrician (2015-2017)
- Diploma in Renewable Energy (2013-2015)

---

## 📊 AI FEATURE 5: ANALYTICS

### How It Works

1. **Career Demand Score**
   - Calculated from job postings
   - Higher score = more jobs available
   - Helps users choose in-demand careers

2. **Skill Popularity**
   - Count of each skill across all resumes
   - Shows most in-demand skills
   - Helps users identify skill gaps

3. **Salary Ranges**
   - Min, max, average salaries per career
   - Helps users make informed decisions
   - Based on job posting data

4. **SDG Distribution**
   - Count of jobs per SDG category
   - Shows impact areas
   - Helps users align with sustainability goals

### Code Flow

```python
# Career demand score
career_demand = db.query(Job).filter(Job.career_id == career_id).count()

# Skill popularity
skill_popularity = db.query(UserSkill.skill_name, func.count(UserSkill.id))\
    .group_by(UserSkill.skill_name)\
    .order_by(func.count(UserSkill.id).desc())\
    .all()

# Salary ranges
salary_stats = db.query(
    func.min(Job.salary_min),
    func.max(Job.salary_max),
    func.avg((Job.salary_min + Job.salary_max) / 2)
).filter(Job.career_id == career_id).first()

# SDG distribution
sdg_distribution = db.query(Job.sdg_tag, func.count(Job.id))\
    .group_by(Job.sdg_tag)\
    .all()
```

### With Imported Resumes

The imported resumes provide rich analytics data:
- 15 resumes across 13 green job sectors
- 90+ skills extracted
- 8 languages represented
- 4 experience levels (Fresher, Entry-Level, Mid-Level, Senior)

### Demo Scenario

**Career Demand:**
1. Solar Installation Technician (23 jobs)
2. Wind Energy Engineer (18 jobs)
3. EV Charging Technician (15 jobs)

**Skill Popularity:**
1. Solar panel installation (8 users)
2. Electrical wiring (7 users)
3. Safety compliance (6 users)

**Salary Ranges:**
- Solar Installation Technician: ₹3,00,000 - ₹6,00,000 (Avg: ₹4,50,000)
- Wind Energy Engineer: ₹5,00,000 - ₹10,00,000 (Avg: ₹7,50,000)

**SDG Distribution:**
- SDG 7 (Clean Energy): 45 jobs
- SDG 13 (Climate Action): 32 jobs
- SDG 11 (Sustainable Cities): 18 jobs

---

## 🎯 COMPLETE DEMO FLOW

### Step 1: User Registration
1. User fills registration form
2. User enters skills (text-based)
3. User selects preferred language
4. User profile created

### Step 2: AI Recommendations
1. System generates user skill embedding
2. System matches to careers (semantic search)
3. System matches to jobs (semantic search)
4. Recommendations displayed with similarity scores

### Step 3: Job Search
1. User searches for jobs (natural language)
2. System generates query embedding
3. System searches job embeddings
4. Results displayed with similarity scores

### Step 4: Multi-Language
1. User switches language
2. UI updates (i18next)
3. Content translates (Google Translate API)
4. Resume/job details shown in selected language

### Step 5: Application
1. User applies to job
2. System matches user skills to job requirements
3. Similarity score calculated
4. Application submitted with match score

---

## 🚀 PERFORMANCE TARGETS

- **API Response:** < 150ms
- **Vector Search:** < 50ms
- **Translation:** Async (cached)
- **Embedding Generation:** ~100ms per document

---

## 📚 KEY FILES

- [`apps/backend/services/ai/embeddings.py`](apps/backend/services/ai/embeddings.py) - Embedding service
- [`apps/backend/services/ai/matching.py`](apps/backend/services/ai/matching.py) - Matching service
- [`apps/backend/services/ai/translation.py`](apps/backend/services/ai/translation.py) - Translation service
- [`apps/backend/scripts/import_resumes.py`](apps/backend/scripts/import_resumes.py) - Import script
- [`apps/backend/models/user.py`](apps/backend/models/user.py) - User, Resume, UserSkill models

---

## 🎉 SUMMARY

Your Green Matchers platform has a complete AI-powered system:

✅ **Semantic Search** - Vector-based similarity search
✅ **Skill Matching** - AI-powered career and job recommendations
✅ **Multi-Language** - Support for 8 Indian languages
✅ **Resume Parsing** - NLP + rule-based skill extraction
✅ **Analytics** - Career demand, skill popularity, salary ranges, SDG distribution

With the imported 15 resumes, you have a demo-ready platform for your hackathon! 🚀
