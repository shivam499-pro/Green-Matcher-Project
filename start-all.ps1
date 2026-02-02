# Green Matchers - Quick Start Script
# This script starts both backend and frontend servers

Write-Host "🚀 Green Matchers - Quick Start Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if MariaDB is running
Write-Host "🔍 Checking MariaDB service..." -ForegroundColor Yellow
$mariadbService = Get-Service -Name MariaDB -ErrorAction SilentlyContinue
if ($mariadbService.Status -eq "Running") {
    Write-Host "✅ MariaDB is running" -ForegroundColor Green
}
else {
    Write-Host "❌ MariaDB is not running" -ForegroundColor Red
    Write-Host "Please start MariaDB service first:" -ForegroundColor Yellow
    Write-Host "  net start MariaDB" -ForegroundColor Cyan
    exit 1
}
Write-Host ""

# Check if database exists
Write-Host "🔍 Checking database..." -ForegroundColor Yellow
$checkDb = mysql -u green_user -pgreen_password_2024 green_matchers -e "SELECT 1" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database 'green_matchers' exists" -ForegroundColor Green
}
else {
    Write-Host "❌ Database not found" -ForegroundColor Red
    Write-Host "Please run database setup first:" -ForegroundColor Yellow
    Write-Host "  mysql -u root -p < setup-database.sql" -ForegroundColor Cyan
    exit 1
}
Write-Host ""

# Start Backend
Write-Host "🐍 Starting Backend Server..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$backendDir = "apps\backend"
if (-not (Test-Path $backendDir)) {
    Write-Host "❌ Backend directory not found: $backendDir" -ForegroundColor Red
    exit 1
}

# Check if virtual environment exists
$venvPath = "$backendDir\venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "⚠️  Virtual environment not found. Creating..." -ForegroundColor Yellow
    python -m venv $venvPath
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment and install dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
& "$venvPath\Scripts\python.exe" -m pip install -r "$backendDir\requirements.txt" --quiet

# Seed database
Write-Host "🌱 Seeding database with demo data..." -ForegroundColor Yellow
& "$venvPath\Scripts\python.exe" "$backendDir\scripts\seed_database.py"

# Start backend server in new window
Write-Host "✅ Starting backend server on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $backendDir; & '$venvPath\Scripts\activate.ps1'; uvicorn main:app --reload --host 0.0.0.0 --port 8000'"

Write-Host ""

# Wait for backend to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running!" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Backend responded with status: $($response.StatusCode)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Backend failed to start. Check the backend window for errors." -ForegroundColor Red
}

Write-Host ""

# Start Frontend
Write-Host "⚛️  Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$frontendDir = "apps\web"
if (-not (Test-Path $frontendDir)) {
    Write-Host "❌ Frontend directory not found: $frontendDir" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "$frontendDir\node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location $frontendDir
    npm install --silent
    Set-Location $PSScriptRoot
}

# Start frontend server in new window
Write-Host "✅ Starting frontend server on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $frontendDir; npm run dev"

Write-Host ""

# Wait for frontend to start
Write-Host "⏳ Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if frontend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running!" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Frontend responded with status: $($response.StatusCode)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Frontend failed to start. Check the frontend window for errors." -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🎉 Green Matchers is now running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:     http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API:   http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs:      http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "👤 Demo Accounts:" -ForegroundColor Cyan
Write-Host "  Job Seeker:  jobseeker1@example.com / password123" -ForegroundColor White
Write-Host "  Employer:      employer1@example.com / password123" -ForegroundColor White
Write-Host "  Admin:         admin@example.com / admin123" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  Complete Guide: COMPLETE_STARTUP_GUIDE.md" -ForegroundColor White
Write-Host "  Project README: README.md" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop the servers." -ForegroundColor Yellow
Write-Host ""
