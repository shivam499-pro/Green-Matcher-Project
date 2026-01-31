# Green Matchers - Architecture & Implementation Plan

## 📋 Executive Summary

**Product Vision:** India's first AI-native green-jobs platform that works for non-English users first, powered by semantic intelligence, not keyword matching.

**Core Differentiator:** Vector-based semantic search + multi-language support for regional Indian users.

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[User Browser]
    end

    subgraph "Frontend Layer"
        B[React 18 + Vite]
        C[Tailwind CSS]
        D[React Router]
        E[i18n JSON Translations]
    end

    subgraph "API Layer"
        F[FastAPI Backend]
        G[JWT Auth Middleware]
        H[API Routes]
    end

    subgraph "AI Services Layer"
        I[Embedding Service]
        J[Translation Service]
        K[Resume Parser]
        L[Matching Engine]
    end

    subgraph "Data Layer"
        M[MariaDB 10.11]
        N[Vector Columns 768-dim]
        O[JSON Fields]
    end

    A --> B
    B --> F
    F --> G
    F --> H
    H --> I
    H --> J
    H --> K
    H --> L
    I --> M
    J --> M
    K --> M
    L --> M
    M --> N
    M --> O
```

---

## 📁 Project Structure

```
apps/
├── backend/
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py          # Database, API settings
│   │   ├── security.py        # JWT, password hashing
│   │   └── deps.py            # Dependency injection
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py            # User, Employer, Admin
│   │   ├── job.py             # Job, Application
│   │   ├── career.py          # Career, Skill
│   │   └── analytics.py       # Stats, metrics
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── job.py
│   │   ├── career.py
│   │   └── analytics.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai/
│   │   │   ├── embeddings.py  # all-mpnet-base-v2
│   │   │   ├── matching.py    # Cosine similarity
│   │   │   ├── translation.py # Google Translate
│   │   │   └── resume_parser.py
│   │   ├── auth.py
│   │   └── analytics.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── jobs.py
│   │   ├── careers.py
│   │   ├── applications.py
│   │   └── analytics.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── db.py              # Database session
│   ├── main.py                # FastAPI app entry
│   └── requirements.txt
│
└── web/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Layout.jsx
    │   │   │   ├── Navigation.jsx
    │   │   │   ├── Footer.jsx
    │   │   │   └── LanguageToggle.jsx
    │   │   ├── job-seeker/
    │   │   │   ├── JobCard.jsx
    │   │   │   ├── CareerCard.jsx
    │   │   │   └── SkillInput.jsx
    │   │   └── employer/
    │   │       ├── JobForm.jsx
    │   │       └── ApplicantCard.jsx
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── CareerExplorer.jsx
    │   │   ├── JobSearch.jsx
    │   │   ├── Recommendations.jsx
    │   │   ├── Profile.jsx
    │   │   ├── EmployerDashboard.jsx
    │   │   └── AdminPanel.jsx
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   ├── useLanguage.js
    │   │   └── useJobs.js
    │   ├── translations/
    │   │   ├── en.json
    │   │   ├── hi.json
    │   │   ├── ta.json
    │   │   ├── te.json
    │   │   ├── bn.json
    │   │   └── mr.json
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── helpers.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('USER', 'EMPLOYER', 'ADMIN') NOT NULL,
    skills JSON,                    -- Array of skill strings
    resume_url VARCHAR(500),
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Careers Table (with vector)
CREATE TABLE careers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    required_skills JSON NOT NULL,
    sdg_tags JSON,                  -- SDG goal numbers
    avg_salary_min INT,
    avg_salary_max INT,
    demand_score FLOAT,
    embedding VECTOR(768),          -- Career embedding
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs Table (with vector)
CREATE TABLE jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employer_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    salary_min INT,
    salary_max INT,
    location VARCHAR(255),
    sdg_tags JSON,
    is_verified BOOLEAN DEFAULT FALSE,
    embedding VECTOR(768),          -- Job description embedding
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id)
);

-- Applications Table
CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Analytics Table
CREATE TABLE analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    metric_value JSON NOT NULL,
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🤖 AI Services Architecture

```mermaid
graph LR
    A[User Input] --> B[Embedding Service]
    B --> C[all-mpnet-base-v2]
    C --> D[768-dim Vector]
    D --> E[MariaDB Vector Column]

    F[Search Query] --> G[Translation Service]
    G --> H[Google Translate API]
    H --> I[Translated Query]

    J[Resume Upload] --> K[Resume Parser]
    K --> L[NLP + Rules]
    L --> M[Extracted Skills]

    N[User Skills] --> O[Matching Engine]
    O --> P[Cosine Similarity]
    P --> Q[Ranked Careers/Jobs]
```

### AI Models Configuration

| Purpose | Model | Dimensions | Use Case |
|---------|-------|------------|----------|
| Embeddings | all-mpnet-base-v2 | 768 | Career/Job/Skill vectors |
| Translation | Google Translate API | N/A | Multi-language support |
| Resume Parsing | spaCy + Custom Rules | N/A | Skill extraction |
| Salary Prediction | Linear Regression | N/A | Salary range estimation |

---

## 🌐 Multi-Language Architecture

### Frontend i18n Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant L as localStorage
    participant T as Translation JSON

    U->>F: Select Language
    F->>L: Save language preference
    F->>T: Load translation file
    T->>F: Return translations
    F->>U: Display translated UI
```

### Backend Translation Flow

```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant G as Google Translate API
    participant D as Database

    F->>B: Request jobs (lang=hi)
    B->>D: Fetch jobs
    D->>B: Return job data
    B->>G: Translate titles/descriptions
    G->>B: Return translations
    B->>F: Return translated jobs
```

### Supported Languages (Phase 1)

| Language | Code | Priority |
|----------|------|----------|
| English | en | Default |
| Hindi | hi | High |
| Tamil | ta | High |
| Telugu | te | Medium |
| Bengali | bn | Medium |
| Marathi | mr | Medium |

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Login (email, password)
    F->>B: POST /auth/login
    B->>D: Verify user
    D->>B: Return user data
    B->>B: Generate JWT token
    B->>F: Return token + user info
    F->>F: Store token in localStorage
    F->>B: Subsequent requests (Authorization header)
    B->>B: Validate JWT
    B->>F: Return protected data
```

### JWT Token Structure

```json
{
  "sub": "user_id",
  "role": "USER|EMPLOYER|ADMIN",
  "exp": 1234567890,
  "iat": 1234567890
}
```

---

## 📊 Analytics Architecture

```mermaid
graph TB
    A[Job Applications] --> B[Analytics Service]
    C[Job Views] --> B
    D[Career Searches] --> B
    B --> E[Career Demand Score]
    B --> F[Skill Popularity]
    B --> G[Salary Analytics]
    E --> H[Analytics Dashboard]
    F --> H
    G --> H
```

### Metrics to Track

1. **Career Demand Score**
   - Formula: `(applications_count / total_jobs) * 100`
   - Updated: Daily

2. **Skill Popularity**
   - Count skill mentions in jobs and user profiles
   - Trend analysis over time

3. **Salary Analytics**
   - Min/Max/Average per career
   - ML regression for prediction

---

## 🎨 UI/UX Design Principles

### Design Rules

1. **White Space**: Generous padding and margins
2. **Typography**: Large, readable fonts (16px base)
3. **No Clutter**: Clean dashboards with essential info only
4. **Mobile-Responsive**: Works on all screen sizes
5. **Accessibility**: WCAG AA compliant

### Color Palette

```css
--primary: #10B981;      /* Emerald 500 - Green theme */
--primary-dark: #059669; /* Emerald 600 */
--secondary: #3B82F6;    /* Blue 500 */
--background: #F9FAFB;   /* Gray 50 */
--surface: #FFFFFF;      /* White */
--text: #111827;         /* Gray 900 */
--text-muted: #6B7280;   /* Gray 500 */
```

---

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Frontend"
        A[Vercel/Netlify]
        B[Static React Build]
    end

    subgraph "Backend"
        C[Cloud VM]
        D[Nginx Reverse Proxy]
        E[Uvicorn + FastAPI]
    end

    subgraph "Database"
        F[Managed MariaDB]
        G[Vector Columns]
    end

    A --> C
    C --> D
    D --> E
    E --> F
    F --> G
```

### Deployment Stack

| Component | Technology | Provider |
|-----------|-----------|---------|
| Frontend | React + Vite | Vercel/Netlify |
| Backend | FastAPI + Uvicorn | Cloud VM (AWS/GCP) |
| Database | MariaDB 10.11 | Managed DB Service |
| Reverse Proxy | Nginx | Same VM as backend |

---

## 📈 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time | < 150ms | p95 latency |
| Vector Search | < 50ms | Query execution |
| Translation | Async | Background queue |
| Page Load | < 2s | First Contentful Paint |
| Bundle Size | < 500KB | Gzipped JS |

---

## 🧪 Demo Strategy

### One-Click Demo Flow

```mermaid
graph LR
    A[Demo Landing] --> B[Auto-login Demo User]
    B --> C[Show Career Recommendations]
    C --> D[Search Jobs with Filters]
    D --> E[Apply to Job]
    E --> F[Switch Language]
    F --> G[View Analytics Dashboard]
```

### Demo Data Requirements

- **Jobs**: 50+ green jobs across sectors
- **Careers**: 20+ career paths with SDG tags
- **Users**: 3 demo accounts (seeker, employer, admin)
- **Resumes**: 5 sample resumes for parsing demo

---

## 🏆 Hackathon Pitch Points

### What Judges See

1. ✅ Real AI (vector search, not keyword matching)
2. ✅ Vector search demo with live similarity scores
3. ✅ Regional language switching (Hindi, Tamil, etc.)
4. ✅ Real jobs from green companies
5. ✅ SDG alignment visualization
6. ✅ Clean, professional UI

### Key Message

> "We didn't build another job portal. We built intelligence for the green economy."

---

## 🔮 Future Enhancements (Post-Hackathon)

1. **Voice Search**: Speech-to-text for regional languages
2. **Chatbot Career Coach**: AI-powered guidance
3. **More Languages**: Expand to 10+ Indian languages
4. **Skill Certification**: Tie-ups with training providers
5. **Mobile App**: React Native version
6. **Advanced Analytics**: ML-based career predictions

---

## 📝 Development Guidelines

### Code Quality

- **Backend**: Follow PEP 8, use type hints
- **Frontend**: ESLint + Prettier, functional components
- **Testing**: Unit tests for critical paths
- **Documentation**: Docstrings for all functions

### Git Workflow

```
main (production)
  └── develop (staging)
       └── feature/* (branches)
```

### Environment Variables

```bash
# Backend
DATABASE_URL=mariadb+pymysql://user:pass@host/db
JWT_SECRET_KEY=your-secret-key
GOOGLE_TRANSLATE_API_KEY=your-api-key

# Frontend
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_TRANSLATE_API_KEY=your-api-key
```

---

## 📚 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `POST /api/users/me/skills` - Add skills

### Jobs
- `GET /api/jobs` - List jobs with filters
- `GET /api/jobs/{id}` - Get job details
- `POST /api/jobs` - Create job (employer)
- `PUT /api/jobs/{id}` - Update job (employer)

### Careers
- `GET /api/careers` - List careers
- `GET /api/careers/{id}` - Get career details
- `GET /api/careers/recommendations` - Get personalized recommendations

### Applications
- `POST /api/applications` - Apply to job
- `GET /api/applications` - List my applications
- `GET /api/applications/{id}` - Get application details

### Analytics
- `GET /api/analytics/career-demand` - Career demand scores
- `GET /api/analytics/skill-popularity` - Popular skills
- `GET /api/analytics/salary-ranges` - Salary analytics

---

## ✅ Success Criteria

### Phase 1 (Foundation)
- [x] Project structure created
- [ ] Backend API running with OpenAPI docs
- [ ] Frontend builds and runs
- [ ] Database connected and migrations working

### Phase 2 (AI Core)
- [ ] Embedding generation working
- [ ] Vector search functional
- [ ] Skill matching algorithm implemented
- [ ] Resume parser extracting skills

### Phase 3 (Multi-Language)
- [ ] Language toggle working
- [ ] Translations for all UI elements
- [ ] Backend translation service functional
- [ ] 5 languages supported

### Phase 4 (Job Ecosystem)
- [ ] Job seeker flows complete
- [ ] Employer flows complete
- [ ] Admin panel functional
- [ ] Role-based access control working

### Phase 5 (Analytics)
- [ ] Analytics dashboard built
- [ ] SDG tags displayed
- [ ] Salary ranges shown
- [ ] Verified badges implemented

### Phase 6 (UI/UX)
- [ ] All 7 pages implemented
- [ ] Mobile responsive
- [ ] Design rules applied
- [ ] Smooth animations

### Phase 7 (Demo)
- [ ] Database seeded
- [ ] Demo accounts created
- [ ] One-click demo flow working
- [ ] Performance targets met

### Phase 8 (Deployment)
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Database configured
- [ ] End-to-end testing passed

---

## 📞 Support & Resources

### Documentation
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- Tailwind: https://tailwindcss.com/
- MariaDB: https://mariadb.com/kb/en/

### AI/ML Resources
- Sentence Transformers: https://www.sbert.net/
- Google Translate API: https://cloud.google.com/translate
- spaCy: https://spacy.io/

---

*Last Updated: 2026-01-31*
