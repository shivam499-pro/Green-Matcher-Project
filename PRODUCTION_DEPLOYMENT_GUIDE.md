# 🚀 Green Matchers - Production Deployment Guide

Complete step-by-step guide for deploying Green Matchers to production.

---

## 📋 Table of Contents

1. [Replace Database Credentials with Environment Variables](#step-1-replace-database-credentials-with-environment-variables)
2. [Replace JWT_SECRET_KEY with Strong Random Key](#step-2-replace-jwt_secret_key-with-strong-random-key)
3. [Use Secrets Manager](#step-3-use-secrets-manager)
4. [Update Database URL to Production Database](#step-4-update-database-url-to-production-database)
5. [Remove or Update Demo Credentials](#step-5-remove-or-update-demo-credentials)
6. [Enable HTTPS](#step-6-enable-https)
7. [Configure Production CORS Origins](#step-7-configure-production-cors-origins)
8. [Set Up Proper Logging and Monitoring](#step-8-set-up-proper-logging-and-monitoring)
9. [Review and Update Security Headers](#step-9-review-and-update-security-headers)
10. [Complete Deployment Checklist](#complete-deployment-checklist)

---

## Step 1: Replace Database Credentials with Environment Variables

### 1.1 Create .env.production Template

Create a new file: `apps/backend/.env.production`

```env
# Database Configuration
DATABASE_URL=mariadb+pymysql://green_user:your-strong-password@your-production-host:3306/green_matchers

# JWT Authentication
JWT_SECRET_KEY=your-generated-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS Settings
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Application Settings
APP_NAME=Green Matchers
APP_VERSION=1.0.0
APP_DESCRIPTION=AI-native green-jobs platform for India

# Environment
ENVIRONMENT=production
```

### 1.2 Update Backend Configuration

Update [`apps/backend/core/config.py`](apps/backend/core/config.py) to use environment variables:

```python
from pydantic_settings import BaseSettings, Field
from typing import List

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = Field(default="mariadb+pymysql://green_user:password@localhost/green_matchers")
    
    # JWT Authentication
    JWT_SECRET_KEY: str = Field(default="your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS Settings
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"]
    )
    
    # Application Settings
    APP_NAME: str = "Green Matchers API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "AI-native green-jobs platform for India"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
```

### 1.3 Set Environment Variables

**Linux/Mac:**
```bash
export DATABASE_URL="mariadb+pymysql://green_user:your-password@your-host:3306/green_matchers"
export JWT_SECRET_KEY="your-secret-key"
export CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="mariadb+pymysql://green_user:your-password@your-host:3306/green_matchers"
$env:JWT_SECRET_KEY="your-secret-key"
$env:CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

---

## Step 2: Replace JWT_SECRET_KEY with Strong Random Key

### 2.1 Generate Strong Secret Key

**Option A: Using Python**
```bash
cd apps/backend
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Option B: Using OpenSSL**
```bash
openssl rand -base64 32
```

**Option C: Using PowerShell**
```powershell
Add-Type -AssemblyName System.Security
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 2.2 Update Environment Variable

Set the generated key as an environment variable:

**Windows (PowerShell):**
```powershell
$env:JWT_SECRET_KEY="your-generated-secret-key-here"
```

**Linux/Mac:**
```bash
export JWT_SECRET_KEY="your-generated-secret-key-here"
```

### 2.3 Update .env.production

Add the generated key to your `.env.production` file:

```env
JWT_SECRET_KEY=your-generated-secret-key-here
```

---

## Step 3: Use Secrets Manager

### 3.1 Option A: AWS Secrets Manager

**Prerequisites:**
- AWS CLI installed
- AWS credentials configured

**Create Secret:**
```bash
aws secretsmanager create-secret \
  --name green-matchers/jwt-secret \
  --secret-string "your-generated-secret-key-here"
```

**Retrieve Secret in Application:**
```python
import boto3
import os

def get_jwt_secret():
    """Get JWT secret from AWS Secrets Manager."""
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId='green-matchers/jwt-secret')
    return response['SecretString']
```

**Update requirements.txt:**
```txt
boto3>=1.28.0
```

### 3.2 Option B: Azure Key Vault

**Prerequisites:**
- Azure CLI installed
- Azure credentials configured

**Create Secret:**
```bash
az keyvault secret set \
  --vault-name green-matchers-kv \
  --name jwt-secret \
  --value "your-generated-secret-key-here"
```

**Retrieve Secret in Application:**
```python
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

def get_jwt_secret():
    """Get JWT secret from Azure Key Vault."""
    credential = DefaultAzureCredential()
    client = SecretClient(
        vault_url="https://green-matchers-kv.vault.azure.net/",
        credential=credential
    )
    secret = client.get_secret("jwt-secret")
    return secret.value
```

**Update requirements.txt:**
```txt
azure-identity>=1.14.0
azure-keyvault-secrets>=4.7.0
```

### 3.3 Create Secrets Manager Integration

Create a new file: `apps/backend/core/secrets.py`

```python
"""
Green Matchers - Secrets Manager Integration
"""
import os
from typing import Optional

def get_secret(secret_name: str, default: Optional[str] = None) -> str:
    """
    Get secret from environment or secrets manager.
    
    Args:
        secret_name: Name of the secret
        default: Default value if secret not found
        
    Returns:
        Secret value
    """
    # Try environment variable first
    value = os.getenv(secret_name)
    if value:
        return value
    
    # Try AWS Secrets Manager
    try:
        import boto3
        client = boto3.client('secretsmanager')
        response = client.get_secret_value(SecretId=f'green-matchers/{secret_name}')
        return response['SecretString']
    except Exception:
        pass
    
    # Try Azure Key Vault
    try:
        from azure.identity import DefaultAzureCredential
        from azure.keyvault.secrets import SecretClient
        credential = DefaultAzureCredential()
        client = SecretClient(
            vault_url=os.getenv('AZURE_KEY_VAULT_URL'),
            credential=credential
        )
        secret = client.get_secret(secret_name)
        return secret.value
    except Exception:
        pass
    
    # Return default if available
    if default:
        return default
    
    raise ValueError(f"Secret '{secret_name}' not found")
```

### 3.4 Update Configuration to Use Secrets Manager

Update [`apps/backend/core/config.py`](apps/backend/core/config.py):

```python
from core.secrets import get_secret

class Settings(BaseSettings):
    """Application settings loaded from environment variables or secrets manager."""
    
    # JWT Authentication - Use secrets manager
    JWT_SECRET_KEY: str = get_secret('JWT_SECRET_KEY', 'default-secret-key')
    
    # Database - Use secrets manager
    DATABASE_URL: str = get_secret('DATABASE_URL', 'default-db-url')
    
    # ... rest of the configuration
```

---

## Step 4: Update Database URL to Production Database

### 4.1 Create Production Database

**Option A: AWS RDS (MariaDB)**
```bash
aws rds create-db-instance \
  --db-instance-identifier green-matchers-db \
  --db-instance-class db.t3.micro \
  --engine mariadb \
  --master-username admin \
  --master-user-password your-strong-password \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxx \
  --db-subnet-group-name green-matchers-subnet-group
```

**Option B: Azure Database for MariaDB**
```bash
az mariadb server create \
  --name green-matchers-db \
  --resource-group green-matchers-rg \
  --location eastus \
  --admin-user admin \
  --admin-password your-strong-password \
  --sku-name B_Gen5_1 \
  --storage-size 5120
```

**Option C: DigitalOcean Managed Database**
```bash
doctl databases create green-matchers-db \
  --engine mariadb \
  --num-nodes 1 \
  --region nyc1 \
  --size db-s-1vcpu-1gb
```

### 4.2 Update Database URL

Update your `.env.production` file:

```env
# AWS RDS
DATABASE_URL=mariadb+pymysql://admin:your-password@green-matchers-db.xxxxxx.us-east-1.rds.amazonaws.com:3306/green_matchers

# Azure Database
DATABASE_URL=mariadb+pymysql://admin:your-password@green-matchers-db.mariadb.database.azure.com:3306/green_matchers

# DigitalOcean
DATABASE_URL=mariadb+pymysql://doadmin:your-password@green-matchers-db-do-user-123456-0.db.ondigitalocean.com:25060/green_matchers
```

### 4.3 Migrate Database

**Export Local Database:**
```bash
mysqldump -u green_user -p green_matchers > green_matchers_backup.sql
```

**Import to Production Database:**
```bash
mysql -h your-production-host -u admin -p green_matchers < green_matchers_backup.sql
```

---

## Step 5: Remove or Update Demo Credentials

### 5.1 Update Seed Script to Use Environment Variables

Update [`apps/backend/scripts/seed_database.py`](apps/backend/scripts/seed_database.py) to use environment variables:

```python
import os
from core.security import get_password_hash

# Get demo password from environment
DEMO_PASSWORD = os.getenv('DEMO_PASSWORD', 'password123')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')

# Update seed data
users_data = [
    {
        "email": "jobseeker1@example.com",
        "password_hash": get_password_hash(DEMO_PASSWORD),
        "full_name": "Rajesh Kumar",
        "role": "USER",
        # ... other fields
    },
    # ... other users
]
```

### 5.2 Create Production Seed Script

Create a new file: `apps/backend/scripts/seed_production.py`

```python
"""
Green Matchers - Production Database Seeding
"""
import os
import sys
from sqlalchemy.orm import Session
from models.user import User
from models.job import Job
from models.career import Career
from models.application import Application
from models.analytics import Analytics
from core.security import get_password_hash
from utils.db import SessionLocal

def seed_production_database():
    """Seed production database with initial data."""
    db = SessionLocal()
    
    try:
        # Create admin user only
        admin_password = os.getenv('ADMIN_PASSWORD')
        if not admin_password:
            print("ERROR: ADMIN_PASSWORD environment variable not set")
            sys.exit(1)
        
        admin = User(
            email="admin@greenmatchers.com",
            password_hash=get_password_hash(admin_password),
            full_name="System Administrator",
            role="ADMIN",
            skills=[],
            saved_jobs=[]
        )
        db.add(admin)
        db.commit()
        
        print("✅ Production database seeded successfully")
        print(f"   Admin: admin@greenmatchers.com")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_production_database()
```

### 5.3 Disable Demo Seed in Production

Update [`apps/backend/scripts/seed_database.py`](apps/backend/scripts/seed_database.py):

```python
import os

def seed_database():
    """Seed database with demo data."""
    
    # Check if running in production
    if os.getenv('ENVIRONMENT') == 'production':
        print("⚠️  Demo seeding disabled in production")
        print("   Use seed_production.py instead")
        return
    
    # ... rest of the seed code
```

---

## Step 6: Enable HTTPS

### 6.1 Option A: Using Nginx (Recommended)

**Install Nginx:**
```bash
sudo apt update
sudo apt install nginx
```

**Create Nginx Configuration:**
```nginx
# /etc/nginx/sites-available/green-matchers

# Backend API
server {
    listen 80;
    server_name api.greenmatchers.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name greenmatchers.com www.greenmatchers.com;
    
    root /var/www/green-matchers/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Enable Configuration:**
```bash
sudo ln -s /etc/nginx/sites-available/green-matchers /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6.2 Option B: Using Certbot (Let's Encrypt)

**Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
```

**Obtain SSL Certificate:**
```bash
sudo certbot --nginx -d greenmatchers.com -d api.greenmatchers.com
```

**Auto-renewal:**
```bash
sudo certbot renew --dry-run
```

### 6.3 Option C: Using Cloudflare (CDN + SSL)

1. Sign up for Cloudflare
2. Add your domain
3. Update nameservers to Cloudflare
4. Enable "Always Use HTTPS" in Cloudflare settings
5. Configure SSL/TLS to "Full" mode

---

## Step 7: Configure Production CORS Origins

### 7.1 Update Backend Configuration

Update [`apps/backend/core/config.py`](apps/backend/core/config.py):

```python
class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # CORS Settings
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"]
    )
```

### 7.2 Set Production CORS Origins

**Update .env.production:**
```env
CORS_ORIGINS=https://greenmatchers.com,https://www.greenmatchers.com
```

**Or set as environment variable:**
```bash
export CORS_ORIGINS="https://greenmatchers.com,https://www.greenmatchers.com"
```

### 7.3 Update Nginx CORS Headers

Add CORS headers to Nginx configuration:

```nginx
location / {
    proxy_pass http://127.0.0.1:8000;
    
    # CORS headers
    add_header 'Access-Control-Allow-Origin' 'https://greenmatchers.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

---

## Step 8: Set Up Proper Logging and Monitoring

### 8.1 Configure Application Logging

Create a new file: `apps/backend/core/logging.py`

```python
"""
Green Matchers - Logging Configuration
"""
import logging
import sys
from pathlib import Path
from core.config import settings

def setup_logging():
    """Setup application logging."""
    
    # Create logs directory
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(log_dir / "app.log"),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Set specific log levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
```

### 8.2 Update Main Application

Update [`apps/backend/main.py`](apps/backend/main.py):

```python
from core.logging import setup_logging

# Setup logging
setup_logging()

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)
```

### 8.3 Add Health Check Endpoint

Update [`apps/backend/main.py`](apps/backend/main.py):

```python
@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "green-matchers-api",
        "version": settings.APP_VERSION
    }
```

### 8.4 Set Up Monitoring

**Option A: AWS CloudWatch**
```bash
# Install CloudWatch agent
sudo apt install amazon-cloudwatch-agent

# Configure CloudWatch
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s green-matchers \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

# Start agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m
```

**Option B: Azure Monitor**
```bash
# Install Azure Monitor agent
wget https://aka.ms/azuremonitoragent -O azuremonitoragent.deb
sudo dpkg -i azuremonitoragent.deb
```

**Option C: Datadog**
```bash
# Install Datadog agent
DD_API_KEY=your-api-key bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
```

---

## Step 9: Review and Update Security Headers

### 9.1 Add Security Headers Middleware

Create a new file: `apps/backend/core/security_headers.py`

```python
"""
Green Matchers - Security Headers Middleware
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response
```

### 9.2 Add Middleware to Application

Update [`apps/backend/main.py`](apps/backend/main.py):

```python
from core.security_headers import SecurityHeadersMiddleware

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)
```

### 9.3 Update Nginx Configuration

Add security headers to Nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name api.greenmatchers.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/api.greenmatchers.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.greenmatchers.com/privkey.pem;
    
    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        # ... other proxy settings
    }
}
```

---

## Complete Deployment Checklist

### Pre-Deployment
- [ ] Generate strong JWT_SECRET_KEY
- [ ] Set up secrets manager (AWS/Azure)
- [ ] Create production database instance
- [ ] Configure production environment variables
- [ ] Update CORS origins for production
- [ ] Remove or disable demo credentials

### Deployment
- [ ] Build frontend for production
- [ ] Deploy backend to server
- [ ] Deploy frontend to server
- [ ] Configure Nginx reverse proxy
- [ ] Obtain SSL certificate
- [ ] Enable HTTPS

### Post-Deployment
- [ ] Run production database seed
- [ ] Test all API endpoints
- [ ] Test all frontend pages
- [ ] Verify authentication flow
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Test security headers

---

## Quick Start Commands

### Build Frontend
```bash
cd apps/web
npm run build
```

### Deploy Backend
```bash
cd apps/backend
# Set environment variables
export DATABASE_URL="your-production-db-url"
export JWT_SECRET_KEY="your-generated-secret"
export CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Test Deployment
```bash
# Test health check
curl https://api.greenmatchers.com/health

# Test API
curl https://api.greenmatchers.com/docs
```

---

## Additional Resources

- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [Azure Key Vault](https://docs.microsoft.com/azure/key-vault/)

---

**Follow this guide step by step to deploy your Green Matchers application to production!** 🚀
