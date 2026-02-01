# Green Matchers - Demo Setup Guide

This guide helps you set up and run the Green Matchers demo for hackathons.

## Prerequisites

1. **Python 3.12+** installed
2. **MariaDB 10.11+** running locally or accessible
3. **Node.js 18+** and **npm** for frontend
4. **Virtual environment** (recommended)

## Quick Start

### 1. Backend Setup

```bash
cd apps/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure database
# Edit core/config.py to set your MariaDB credentials
# DATABASE_URL = "mariadb+mariadbconnector://username:password@localhost:3306/green_matchers"

# Run database migrations (if using Alembic)
# alembic upgrade head

# Seed the database with demo data
python scripts/seed_database.py
```

### 2. Frontend Setup

```bash
cd apps/web

# Install dependencies
npm install

# Configure API URL
# Create .env file or edit vite.config.js
# VITE_API_URL=http://localhost:8000/api

# Start development server
npm run dev
```

### 3. Start Backend Server

```bash
cd apps/backend

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Demo Credentials

The database seeding script creates these demo accounts:

| Role | Email | Password | Purpose |
|-------|--------|----------|---------|
| Job Seeker | jobseeker1@example.com | password123 | Hindi speaker, solar skills |
| Job Seeker | jobseeker2@example.com | password123 | Tamil speaker, farming skills |
| Job Seeker | jobseeker3@example.com | password123 | Telugu speaker, wind skills |
| Employer | employer1@example.com | password123 | Green Energy Corp |
| Employer | employer2@example.com | password123 | Sustainable Solutions Ltd |
| Admin | admin@example.com | admin123 | System administrator |

## Demo Flow

### For Judges

1. **Landing Page** - Shows the platform overview with features
2. **Language Toggle** - Switch between English, Hindi, Tamil, Telugu, Bengali, Marathi
3. **Job Seeker Flow**:
   - Login as `jobseeker1@example.com`
   - Browse jobs with semantic search
   - View career recommendations
   - Apply to jobs
   - Check profile and analytics
4. **Employer Flow**:
   - Login as `employer1@example.com`
   - Post new jobs
   - View applicants
   - Manage posted jobs
5. **Admin Flow**:
   - Login as `admin@example.com`
   - View analytics dashboard
   - Verify companies
   - Manage users

### Key Features to Demonstrate

1. **AI-Powered Search** - Try searching for "solar" or "farming" to see semantic matching
2. **Multi-Language Support** - Toggle language to see translations
3. **SDG Alignment** - View jobs with SDG goal tags
4. **Analytics Dashboard** - See career demand, skill popularity, salary ranges
5. **Skill-Based Matching** - Profile shows skills, recommendations based on skills

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Troubleshooting

### Database Connection Issues

```bash
# Check MariaDB is running
# Windows: sc query MariaDB
# Linux: sudo systemctl status mariadb

# Test connection
mysql -u username -p -h localhost -P 3306
```

### Port Already in Use

```bash
# Check what's using port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Linux/Mac

# Kill the process if needed
taskkill /PID <pid> /F  # Windows
kill -9 <pid>  # Linux/Mac
```

### Import Errors

```bash
# Reinstall dependencies
pip install --force-reinstall -r requirements.txt

# Clear Python cache
pip cache purge
```

## Performance Targets

The demo is optimized for:
- **API Response**: < 150ms
- **Vector Search**: < 50ms
- **Page Load**: < 2s

## Hackathon Tips

1. **Pre-seed the database** before the demo starts
2. **Have multiple browser tabs ready** - one for each user role
3. **Prepare demo script** - know which features to show in what order
4. **Highlight AI features** - semantic search, skill matching, recommendations
5. **Show multi-language** - switch languages during the demo
6. **Mention SDG alignment** - all jobs contribute to UN Sustainable Development Goals

## Clean Up

To reset the database for a fresh demo:

```bash
cd apps/backend
python scripts/seed_database.py
```

This will clear all data and re-seed with fresh demo data.
