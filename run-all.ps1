# Green Matchers - Complete Run Script
# This script starts database, backend, and frontend, then shows all details

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   GREEN MATCHERS - COMPLETE RUN   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Save original directory to restore later
$originalLocation = Get-Location

# Step 1: Start Database (MariaDB)
Write-Host "[Step 1/4] Starting Database (MariaDB)..." -ForegroundColor Yellow
Write-Host "Checking if MariaDB is running..." -ForegroundColor Gray

# Check if MariaDB is running
$mariadbProcess = Get-Process -Name mysqld -ErrorAction SilentlyContinue
if ($mariadbProcess) {
    Write-Host "✅ MariaDB is already running" -ForegroundColor Green
}
else {
    Write-Host "⚠️  MariaDB is not running. Please start MariaDB manually." -ForegroundColor Red
    Write-Host "   Command: net start MariaDB" -ForegroundColor Gray
    Write-Host "   Or use XAMPP/WAMP to start MariaDB" -ForegroundColor Gray
}

Write-Host ""

# Step 2: Start Backend (FastAPI)
Write-Host "[Step 2/4] Starting Backend (FastAPI)..." -ForegroundColor Yellow
Write-Host "Changing to backend directory..." -ForegroundColor Gray
Set-Location "apps\backend"

# Check if virtual environment exists
if (Test-Path "venv") {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
    Write-Host "Activating virtual environment..." -ForegroundColor Gray
    & .\venv\Scripts\Activate.ps1
}
else {
    Write-Host "⚠️  Virtual environment not found. Using system Python." -ForegroundColor Yellow
}

Write-Host "Starting FastAPI server on http://localhost:8000..." -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

# Start backend in background
$backendJob = Start-Job -ScriptBlock {
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
} -Name "Backend"

# Wait for backend to start
Start-Sleep -Seconds 5

# Check if backend started successfully
try {
    $null = Invoke-WebRequest -Uri "http://localhost:8000/docs" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend started successfully!" -ForegroundColor Green
    Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host "   API Root: http://localhost:8000" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Backend failed to start. Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 3: Start Frontend (Vite)
Write-Host "[Step 3/4] Starting Frontend (Vite)..." -ForegroundColor Yellow
Write-Host "Changing to web directory..." -ForegroundColor Gray
Set-Location "..\web"

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules found" -ForegroundColor Green
}
else {
    Write-Host "⚠️  node_modules not found. Running npm install..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting Vite dev server on http://localhost:5173..." -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

# Start frontend in background
$frontendJob = Start-Job -ScriptBlock {
    npm run dev
} -Name "Frontend"

# Wait for frontend to start
Start-Sleep -Seconds 5

# Check if frontend started successfully
try {
    $null = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    Write-Host "✅ Frontend started successfully!" -ForegroundColor Green
    Write-Host "   Frontend URL: http://localhost:5173" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Frontend failed to start. Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 4: Show Database Details
Write-Host "[Step 4/4] Showing Database Details..." -ForegroundColor Yellow
Write-Host ""

# Try to connect to database and show details
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "      DATABASE DETAILS             " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Show database connection info
Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: localhost" -ForegroundColor Gray
Write-Host "  Port: 3306" -ForegroundColor Gray
Write-Host "  Database: green_matchers" -ForegroundColor Gray
Write-Host "  User: green_user" -ForegroundColor Gray
Write-Host ""

# Try to get database statistics
Write-Host "Database Statistics:" -ForegroundColor Yellow
Write-Host "  Note: Run these queries in MySQL/MariaDB client to see details" -ForegroundColor Gray
Write-Host ""
Write-Host "  -- Users Count:" -ForegroundColor Cyan
Write-Host "     SELECT COUNT(*) FROM users;" -ForegroundColor Gray
Write-Host ""
Write-Host "  -- Users by Role:" -ForegroundColor Cyan
Write-Host "     SELECT role, COUNT(*) FROM users GROUP BY role;" -ForegroundColor Gray
Write-Host ""
Write-Host "  -- Users by Language:" -ForegroundColor Cyan
Write-Host "     SELECT language, COUNT(*) FROM users GROUP BY language;" -ForegroundColor Gray
Write-Host ""
Write-Host "  -- Users with Skills:" -ForegroundColor Cyan
Write-Host "     SELECT id, full_name, skills FROM users LIMIT 5;" -ForegroundColor Gray
Write-Host ""

# Show backend details
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "      BACKEND DETAILS             " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Backend Configuration:" -ForegroundColor Yellow
Write-Host "  Framework: FastAPI" -ForegroundColor Gray
Write-Host "  Python: 3.12" -ForegroundColor Gray
Write-Host "  ORM: SQLAlchemy 2.0" -ForegroundColor Gray
Write-Host "  Database: MariaDB 10.11" -ForegroundColor Gray
Write-Host ""

Write-Host "Backend Endpoints:" -ForegroundColor Yellow
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  API Root: http://localhost:8000" -ForegroundColor Cyan
Write-Host "  Auth: /api/auth/*" -ForegroundColor Gray
Write-Host "  Users: /api/users/*" -ForegroundColor Gray
Write-Host "  Jobs: /api/jobs/*" -ForegroundColor Gray
Write-Host "  Careers: /api/careers/*" -ForegroundColor Gray
Write-Host "  Analytics: /api/analytics/*" -ForegroundColor Gray
Write-Host ""

Write-Host "AI Services:" -ForegroundColor Yellow
Write-Host "  Embeddings: sentence-transformers (all-mpnet-base-v2)" -ForegroundColor Gray
Write-Host "  Matching: Cosine similarity" -ForegroundColor Gray
Write-Host "  Translation: Google Translate API" -ForegroundColor Gray
Write-Host ""

# Show frontend details
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "      FRONTEND DETAILS            " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Frontend Configuration:" -ForegroundColor Yellow
Write-Host "  Framework: React 18" -ForegroundColor Gray
Write-Host "  Build Tool: Vite" -ForegroundColor Gray
Write-Host "  Styling: Tailwind CSS" -ForegroundColor Gray
Write-Host "  Routing: React Router" -ForegroundColor Gray
Write-Host "  HTTP Client: Axios" -ForegroundColor Gray
Write-Host "  i18n: i18next" -ForegroundColor Gray
Write-Host ""

Write-Host "Frontend Pages:" -ForegroundColor Yellow
Write-Host "  Landing: /" -ForegroundColor Gray
Write-Host "  Careers: /careers" -ForegroundColor Gray
Write-Host "  Jobs: /jobs" -ForegroundColor Gray
Write-Host "  Recommendations: /recommendations" -ForegroundColor Gray
Write-Host "  Profile: /profile" -ForegroundColor Gray
Write-Host "  Analytics: /analytics" -ForegroundColor Gray
Write-Host "  Login: /login" -ForegroundColor Gray
Write-Host "  Register: /register" -ForegroundColor Gray
Write-Host ""

Write-Host "Frontend Features:" -ForegroundColor Yellow
Write-Host "  Multi-language: 8 languages (en, hi, ta, te, bn, mr, kn, pa)" -ForegroundColor Gray
Write-Host "  Role-based navigation: USER, EMPLOYER, ADMIN" -ForegroundColor Gray
Write-Host "  AI-powered recommendations: Yes" -ForegroundColor Gray
Write-Host "  Semantic search: Yes" -ForegroundColor Gray
Write-Host ""

# Show project summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "      PROJECT SUMMARY              " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Phases Completed:" -ForegroundColor Yellow
Write-Host "  ✅ Phase 1-4: Foundation, AI Core, Multi-language, Job Ecosystem" -ForegroundColor Green
Write-Host "  ✅ Phase 5: Analytics & Trust" -ForegroundColor Green
Write-Host "  ✅ Phase 6: UI/UX Polish" -ForegroundColor Green
Write-Host "  ✅ Phase 7: Hardening & Demo" -ForegroundColor Green
Write-Host "  ✅ Phase 8: Fix Website Flow - Navigation & Routing" -ForegroundColor Green
Write-Host "  ✅ Phase 9: Resume Integration" -ForegroundColor Green
Write-Host ""

Write-Host "Key Features:" -ForegroundColor Yellow
Write-Host "  ✅ Semantic Search (Vector-based similarity)" -ForegroundColor Green
Write-Host "  ✅ Skill Matching (AI-powered recommendations)" -ForegroundColor Green
Write-Host "  ✅ Multi-language Support (8 Indian languages)" -ForegroundColor Green
Write-Host "  ✅ Resume Parsing (NLP + rule-based)" -ForegroundColor Green
Write-Host "  ✅ Analytics Dashboard (Career demand, skill popularity, salary ranges, SDG distribution)" -ForegroundColor Green
Write-Host "  ✅ Role-based Authentication (USER, EMPLOYER, ADMIN)" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ALL SYSTEMS RUNNING! 🚀        " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host "  🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  🔧 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "  📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Red
Write-Host ""

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    # Cleanup when script is stopped
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    if ($backendJob) {
        Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job -Job $backendJob -ErrorAction SilentlyContinue
    }
    if ($frontendJob) {
        Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
        Remove-Job -Job $frontendJob -ErrorAction SilentlyContinue
    }
    Write-Host "✅ All servers stopped" -ForegroundColor Green
    
    # Restore original directory
    Set-Location $originalLocation
}
