# Green Matchers - Quick Start Guide

## 🚀 Getting Started

This guide will help you set up the Green Matchers development environment from scratch.

---

## 📋 Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Python | 3.12+ | Backend runtime |
| Node.js | 18+ | Frontend runtime |
| MariaDB | 10.11+ | Database with vector support |
| Git | Latest | Version control |

### Optional but Recommended

- **VS Code** with extensions:
  - Python
  - Pylance
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

---

## 🛠️ Phase 1: Environment Setup

### Step 1: Clone and Navigate

```bash
cd c:/Green-Matcher-Project
```

### Step 2: Set Up Backend

```bash
# Create backend directory structure
mkdir -p apps/backend/{core,models,schemas,services,routes,utils}

# Create virtual environment
cd apps/backend
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pymysql python-jose[cryptography] passlib[bcrypt] python-multipart sentence-transformers google-cloud-translate spacy scikit-learn numpy pandas

# Create requirements.txt
pip freeze > requirements.txt
```

### Step 3: Set Up Frontend

```bash
# Navigate back to project root
cd ../..

# Create frontend with Vite
npm create vite@latest apps/web -- --template react

# Navigate to frontend
cd apps/web

# Install dependencies
npm install

# Install additional dependencies
npm install react-router-dom axios i18next react-i18next i18next-browser-languagedetector tailwindcss postcss autoprefixer chart.js react-chartjs-2

# Initialize Tailwind CSS
npx tailwindcss init -p
```

### Step 4: Configure MariaDB

```bash
# Install MariaDB 10.11 (Windows)
# Download from: https://mariadb.org/download/

# Create database
mysql -u root -p
```

```sql
CREATE DATABASE green_matchers CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'green_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON green_matchers.* TO 'green_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📁 Phase 2: Project Structure Creation

### Backend Files

Create the following files in `apps/backend/`:

#### `apps/backend/core/config.py`
```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = "mariadb+pymysql://green_user:your_password@localhost/green_matchers"
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    GOOGLE_TRANSLATE_API_KEY: str = ""
    EMBEDDING_MODEL: str = "sentence-transformers/all-mpnet-base-v2"
    EMBEDDING_DIM: int = 768

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
```

#### `apps/backend/core/security.py`
```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from core.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
```

#### `apps/backend/utils/db.py`
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### `apps/backend/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, users, jobs, careers, applications, analytics

app = FastAPI(
    title="Green Matchers API",
    description="AI-native green-jobs platform for India",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(careers.router, prefix="/api/careers", tags=["Careers"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "Green Matchers API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

### Frontend Files

Create the following files in `apps/web/`:

#### `apps/web/vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

#### `apps/web/tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
    },
  },
  plugins: [],
}
```

#### `apps/web/src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}
```

#### `apps/web/src/main.jsx`
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### `apps/web/src/App.jsx`
```javascript
import { BrowserRouter } from 'react-router-dom'
import Layout from './components/common/Layout'

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
```

---

## 🔧 Phase 3: Configuration Files

### Backend `.env` file

Create `apps/backend/.env`:
```env
DATABASE_URL=mariadb+pymysql://green_user:your_password@localhost/green_matchers
JWT_SECRET_KEY=your-secret-key-change-in-production
GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key
```

### Frontend `.env` file

Create `apps/web/.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key
```

---

## 🏃 Phase 4: Running the Application

### Start Backend

```bash
cd apps/backend
venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

API Documentation: http://localhost:8000/docs

### Start Frontend

```bash
cd apps/web
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## ✅ Phase 5: Verification

### Check Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

### Check API Documentation

Visit: http://localhost:8000/docs

You should see the FastAPI automatic documentation (Swagger UI).

### Check Frontend

Visit: http://localhost:5173

You should see the React application running.

---

## 📚 Next Steps

After completing the quick start:

1. **Phase 1 Tasks**: Create database models and schemas
2. **Phase 2 Tasks**: Implement AI services (embeddings, translation)
3. **Phase 3 Tasks**: Build multi-language support
4. **Phase 4 Tasks**: Create job seeker and employer flows
5. **Phase 5 Tasks**: Implement analytics and trust signals

Refer to the full [Architecture Plan](./architecture-plan.md) for detailed implementation guidance.

---

## 🐛 Troubleshooting

### Common Issues

**Issue: MariaDB connection failed**
- Solution: Check if MariaDB service is running
- Verify credentials in `.env` file

**Issue: Frontend proxy not working**
- Solution: Ensure backend is running on port 8000
- Check `vite.config.js` proxy settings

**Issue: Import errors in Python**
- Solution: Activate virtual environment
- Run `pip install -r requirements.txt`

**Issue: Tailwind CSS not working**
- Solution: Check `tailwind.config.js` content paths
- Ensure `@tailwind` directives are in `index.css`

---

## 📞 Getting Help

- Check the [Architecture Plan](./architecture-plan.md) for detailed documentation
- Review the [Todo List](../.kilocodemodes) for task tracking
- Refer to official documentation:
  - FastAPI: https://fastapi.tiangolo.com/
  - React: https://react.dev/
  - Tailwind: https://tailwindcss.com/

---

*Last Updated: 2026-01-31*
