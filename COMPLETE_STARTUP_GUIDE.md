# 🚀 Green Matchers - Complete Startup & Testing Guide

This guide ensures your website is **fully functional** with backend and AI features.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Python 3.13+** installed
- [ ] **Node.js 18+** installed
- [ ] **MariaDB 10.11+** installed and running
- [ ] **Git** (optional, for version control)

---

## 🔧 Step 1: Database Setup

### 1.1 Start MariaDB Service

**Windows:**
```bash
# Start MariaDB service
net start MariaDB

# Or if using MySQL
net start MySQL
```

**Linux/Mac:**
```bash
# Start MariaDB service
sudo systemctl start mariadb

# Or
sudo service mariadb start
```

### 1.2 Create Database and User

Run the database setup script:

```bash
# Navigate to project root
cd C:\Green-Matcher-Project

# Execute database setup script
mysql -u root -p < setup-database.sql
```

**What this creates:**
- Database: `green_matchers`
- User: `green_user` with password `green_password_2024`
- All necessary tables with proper structure

**Verify database was created:**
```bash
mysql -u green_user -pgreen_password_2024 green_matchers
```

You should see the MariaDB prompt.

---

## 🐍 Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd apps/backend
```

### 2.2 Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed fastapi-0.115.0
Successfully installed uvicorn-0.30.0
Successfully installed sqlalchemy-2.0.36
... (many more packages)
```

### 2.4 Verify Environment Variables

Check that `.env` file exists with correct values:

```bash
# View .env file (Windows)
type .env

# View .env file (Linux/Mac)
cat .env
```

**Expected content:**
```env
DATABASE_URL=mariadb+pymysql://green_user:green_password_2024@localhost/green_matchers
JWT_SECRET_KEY=green-matchers-secret-key-2024-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
APP_NAME=Green Matchers
APP_VERSION=1.0.0
APP_DESCRIPTION=AI-native green-jobs platform for India
ENVIRONMENT=development
```

### 2.5 Seed Database with Demo Data

```bash
python scripts/seed_database.py
```

**Expected output:**
```
🌱 Starting database seeding for Green Matchers...
==================================================
🔨 Creating database tables...
✅ Database tables created

🗑️  Clearing existing data...

📊 Seeding careers...
✅ Seeded 10 careers

👥 Seeding users...
✅ Seeded 6 users

💼 Seeding jobs...
✅ Seeded 9 jobs

📝 Seeding applications...
✅ Seeded 5 applications

📈 Seeding analytics...
✅ Seeded 4 analytics metrics

==================================================
✅ Database seeding completed successfully!

📋 Demo Credentials:
   Job Seeker 1: jobseeker1@example.com / password123
   Job Seeker 2: jobseeker2@example.com / password123
   Job Seeker 3: jobseeker3@example.com / password123
   Employer 1:   employer1@example.com / password123
   Employer 2:   employer2@example.com / password123
   Admin:        admin@example.com / admin123

🚀 Ready for demo!
```

### 2.6 Start Backend Server

**Terminal 1 - Keep this open:**
```bash
# Make sure virtual environment is activated
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 2.7 Verify Backend is Running

Open your browser and visit:
- **API Root:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

**Expected responses:**

**Root:**
```json
{
  "message": "Welcome to Green Matchers API",
  "version": "1.0.0",
  "docs": "/docs"
}
```

**Health Check:**
```json
{
  "status": "healthy",
  "service": "green-matchers-api",
  "version": "1.0.0"
}
```

---

## ⚛️ Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory

**Open a NEW terminal (Terminal 2):**
```bash
cd apps/web
```

### 3.2 Install Dependencies

```bash
npm install
```

**Expected output:**
```
added 1423 packages, and audited 1424 packages in 45s
found 0 vulnerabilities
```

### 3.3 Verify Environment Variables

Check that `.env` file exists:

```bash
# View .env file (Windows)
type .env

# View .env file (Linux/Mac)
cat .env
```

**Expected content:**
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_TRANSLATE_API_KEY=
```

### 3.4 Start Frontend Development Server

**Terminal 2 - Keep this open:**
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 3.5 Verify Frontend is Running

Open your browser and visit:
- **Frontend:** http://localhost:5173

You should see the Green Matchers landing page with:
- Hero section: "Find Your Dream Green Job"
- Features section with 6 feature cards
- CTA section: "Ready to start your green career?"

---

## ✅ Step 4: Full Integration Testing

### 4.1 Test Landing Page Navigation

1. **Open:** http://localhost:5173

2. **Test "Get Started" button:**
   - Click "Get Started" button
   - Should navigate to `/register`
   - Should see registration form

3. **Test "Browse Jobs" button:**
   - Click "Browse Jobs" button
   - Should navigate to `/jobs`
   - Should see list of 9 jobs from database

4. **Test "Explore Careers" button:**
   - Click "Explore Careers" button
   - Should navigate to `/careers`
   - Should see list of 10 careers from database

5. **Test Navigation Bar:**
   - Click "Sign In" in navigation
   - Should navigate to `/login`
   - Should see login form

### 4.2 Test Registration Flow

1. **Navigate to:** http://localhost:5173/register

2. **Fill registration form:**
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
   - Role: `Job Seeker`

3. **Click "Sign Up" button**

4. **Expected result:**
   - User is created in database
   - Redirected to home page (`/`)
   - Token stored in localStorage
   - User data stored in localStorage

5. **Verify in browser console:**
   ```javascript
   // Open browser console (F12)
   localStorage.getItem('token')
   localStorage.getItem('user')
   ```

### 4.3 Test Login Flow

1. **Navigate to:** http://localhost:5173/login

2. **Login with demo account:**
   - Email: `jobseeker1@example.com`
   - Password: `password123`

3. **Click "Sign In" button**

4. **Expected result:**
   - Successful login
   - Redirected to job seeker dashboard (`/dashboard`)
   - Token stored in localStorage
   - Navigation shows user-specific links

### 4.4 Test Jobs Page with Backend

1. **Navigate to:** http://localhost:5173/jobs

2. **Expected to see:**
   - List of 9 jobs from database
   - Each job card shows:
     - Job title
     - Company name
     - Location
     - Salary range
     - SDG tags
     - "View Details" button

3. **Test search functionality:**
   - Type "solar" in search box
   - Click "Search" button
   - Should see filtered results (Solar Panel Installation Technician)

4. **Test filters:**
   - Click "Filters" button
   - Select SDG tag: "SDG 7"
   - Click "Search"
   - Should see jobs with SDG 7 tag

5. **Test job detail view:**
   - Click on any job card
   - Should navigate to `/jobs/{id}`
   - Should see full job details

### 4.5 Test Careers Page with Backend

1. **Navigate to:** http://localhost:5173/careers

2. **Expected to see:**
   - List of 10 careers from database
   - Each career card shows:
     - Career title
     - Description
     - Salary range
     - Required skills
     - SDG tags
     - Demand score

3. **Test search functionality:**
   - Type "solar" in search box
   - Click "Search" button
   - Should see filtered results (Solar Energy Technician)

4. **Test SDG filter:**
   - Select SDG: "SDG 7 - Affordable & Clean Energy"
   - Click "Search"
   - Should see careers with SDG 7 tag

### 4.6 Test AI Features

#### Test 1: Semantic Job Search

1. **Navigate to:** http://localhost:5173/jobs

2. **Search with natural language:**
   - Type: "renewable energy jobs"
   - Click "Search"
   - Should see jobs related to renewable energy (solar, wind, etc.)

3. **Search with specific skills:**
   - Type: "electrical systems"
   - Click "Search"
   - Should see jobs requiring electrical skills

#### Test 2: Career Recommendations (AI-Powered)

1. **Login as job seeker:**
   - Email: `jobseeker1@example.com`
   - Password: `password123`

2. **Navigate to:** http://localhost:5173/recommendations

3. **Expected to see:**
   - AI-powered career recommendations
   - Each recommendation shows:
     - Career title
     - Similarity score (percentage)
     - Matched skills (green checkmarks)
     - Missing skills (red X marks)
     - Confidence score

4. **Example output:**
   ```
   Career: Solar Energy Technician
   Similarity: 85%
   Matched Skills: ✓ solar installation, ✓ electrical systems
   Missing Skills: ✗ maintenance, ✗ safety protocols
   ```

#### Test 3: Skill-Based Matching

1. **Navigate to:** http://localhost:5173/profile

2. **Add skills:**
   - Type: `python, machine learning, data science`
   - Click "Save Profile"

3. **Navigate to:** http://localhost:5173/recommendations

4. **Expected to see:**
   - Careers matching your skills
   - High similarity scores for data-related careers
   - Clear explanation of matched/missing skills

### 4.7 Test Analytics Dashboard

1. **Login as admin:**
   - Email: `admin@example.com`
   - Password: `admin123`

2. **Navigate to:** http://localhost:5173/analytics

3. **Expected to see:**
   - Career Demand Chart
   - Skill Popularity Chart
   - Salary Range Chart
   - SDG Distribution Chart

4. **Verify data:**
   - Charts should show data from database
   - Numbers should match seeded analytics data
   - Charts should be interactive

---

## 🐛 Troubleshooting

### Issue: Backend won't start

**Error:** `Can't connect to MySQL server`

**Solution:**
1. Check MariaDB is running:
   ```bash
   # Windows
   sc query MariaDB
   
   # Linux/Mac
   sudo systemctl status mariadb
   ```

2. Verify database credentials in `.env` file
3. Check database exists:
   ```bash
   mysql -u green_user -pgreen_password_2024 green_matchers
   ```

### Issue: Frontend can't connect to backend

**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution:**
1. Verify backend is running on port 8000
2. Check frontend `.env` file has correct API URL
3. Check browser console for CORS errors
4. Verify CORS origins in backend `.env`:
   ```env
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

### Issue: No data showing on pages

**Error:** Pages load but show no jobs/careers

**Solution:**
1. Verify database was seeded:
   ```bash
   cd apps/backend
   python scripts/seed_database.py
   ```

2. Check backend logs for errors
3. Open browser DevTools (F12) and check Network tab
4. Verify API calls are successful (status 200)

### Issue: AI features not working

**Error:** Recommendations show no results or errors

**Solution:**
1. Check AI services are imported correctly in backend
2. Verify embeddings model is loaded
3. Check backend logs for AI-related errors
4. Ensure user has skills in their profile

---

## 📊 Verification Checklist

After completing all steps, verify:

### Backend
- [ ] MariaDB is running
- [ ] Database `green_matchers` exists
- [ ] Backend server running on http://localhost:8000
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] Health check returns healthy status
- [ ] Database seeded with demo data

### Frontend
- [ ] Frontend server running on http://localhost:5173
- [ ] Landing page loads correctly
- [ ] Navigation bar shows correct links
- [ ] All buttons navigate to correct pages

### Integration
- [ ] Jobs page shows 9 jobs from database
- [ ] Careers page shows 10 careers from database
- [ ] Registration creates user in database
- [ ] Login authenticates user correctly
- [ ] Navigation works after login

### AI Features
- [ ] Semantic search returns relevant results
- [ ] Career recommendations show similarity scores
- [ ] Skill matching shows matched/missing skills
- [ ] Analytics charts display data correctly

---

## 🎯 Demo Scenarios

### Scenario 1: Job Seeker Complete Flow

1. **Landing Page** → Click "Get Started"
2. **Register** → Create new account
3. **Login** → Sign in with credentials
4. **Dashboard** → View personalized recommendations
5. **Jobs** → Search and browse jobs
6. **Job Detail** → View job details
7. **Apply** → Submit application

**AI Features Demonstrated:**
- ✅ Skill-to-career matching
- ✅ Semantic job search
- ✅ Explainable AI (confidence scores)

### Scenario 2: Employer Complete Flow

1. **Landing Page** → Click "Get Started"
2. **Register** → Create employer account
3. **Login** → Sign in as employer
4. **Dashboard** → View posted jobs
5. **Post Job** → Create new job posting
6. **View Applicants** → Review applications

### Scenario 3: Admin Complete Flow

1. **Landing Page** → Click "Get Started"
2. **Login** → Sign in as admin
3. **Dashboard** → View all users and jobs
4. **Analytics** → View charts and metrics
5. **Verify Jobs** → Approve/reject job postings

---

## 🚀 Ready for Demo!

Once all checks pass, your Green Matchers application is:

✅ **Fully functional** with backend integration
✅ **AI-powered** with semantic search and recommendations
✅ **Demo-ready** with complete test data
✅ **Production-ready** architecture

**Access URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

**Demo Accounts:**
- Job Seeker: `jobseeker1@example.com` / `password123`
- Employer: `employer1@example.com` / `password123`
- Admin: `admin@example.com` / `admin123`

---

## 📚 Additional Resources

- [README.md](../README.md) - Project overview
- [Architecture Plan](../plans/architecture-plan.md) - Technical details
- [AI Features Guide](../docs/AI_FEATURES_GUIDE.md) - AI implementation
- [API Documentation](http://localhost:8000/docs) - Interactive API docs

---

**Last Updated:** 2026-02-02
**Version:** 1.0.0
