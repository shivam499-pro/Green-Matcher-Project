# 🚀 Green Matchers - Complete Deployment Script

This script automates the complete deployment of Green Matchers to production.

---

## Prerequisites

Before running this script, ensure you have:

1. **Production Server Access**
   - SSH access to your production server
   - Server IP address
   - SSH username and password/key

2. **Cloud Provider Account**
   - AWS account (for RDS, CloudWatch) OR
   - Azure account (for Database, Monitor) OR
   - DigitalOcean account (for Database)

3. **Domain Name**
   - Registered domain (e.g., greenmatchers.com)
   - Access to DNS settings

4. **Generated Values**
   - Strong JWT_SECRET_KEY (32+ characters)
   - Strong admin password (16+ characters)
   - Database password (16+ characters)

---

## Step 1: Generate Secrets

### Generate JWT Secret Key
```bash
# Option A: Python
cd apps/backend
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Option B: OpenSSL
openssl rand -base64 32

# Option C: PowerShell
Add-Type -AssemblyName System.Security
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Save the generated key securely!** You'll need it for:
- Environment variable: `JWT_SECRET_KEY`
- Secrets manager: `green-matchers/jwt-secret`

### Generate Admin Password
```bash
# Generate strong password
python -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*') for _ in range(20)))"
```

**Save the generated password securely!** You'll need it for:
- Environment variable: `ADMIN_PASSWORD`
- Secrets manager: `green-matchers/admin-password`

---

## Step 2: Set Up Secrets Manager

### Option A: AWS Secrets Manager

```bash
# Set AWS credentials
aws configure

# Create JWT Secret
aws secretsmanager create-secret \
  --name green-matchers/jwt-secret \
  --secret-string "YOUR_GENERATED_JWT_SECRET_HERE"

# Create Database URL Secret
aws secretsmanager create-secret \
  --name green-matchers/database-url \
  --secret-string "mariadb+pymysql://admin:YOUR_DB_PASSWORD@YOUR_DB_HOST:3306/green_matchers"

# Create Admin Password Secret
aws secretsmanager create-secret \
  --name green-matchers/admin-password \
  --secret-string "YOUR_GENERATED_ADMIN_PASSWORD_HERE"

# Verify secrets
aws secretsmanager list-secrets
```

### Option B: Azure Key Vault

```bash
# Login to Azure
az login

# Create Key Vault
az keyvault create \
  --name green-matchers-kv \
  --resource-group green-matchers-rg \
  --location eastus

# Create JWT Secret
az keyvault secret set \
  --vault-name green-matchers-kv \
  --name jwt-secret \
  --value "YOUR_GENERATED_JWT_SECRET_HERE"

# Create Database URL Secret
az keyvault secret set \
  --vault-name green-matchers-kv \
  --name database-url \
  --value "mariadb+pymysql://admin:YOUR_DB_PASSWORD@YOUR_DB_HOST:3306/green_matchers"

# Create Admin Password Secret
az keyvault secret set \
  --vault-name green-matchers-kv \
  --name admin-password \
  --value "YOUR_GENERATED_ADMIN_PASSWORD_HERE"

# Verify secrets
az keyvault secret list --vault-name green-matchers-kv
```

---

## Step 3: Create Production Database

### Option A: AWS RDS

```bash
# Create VPC Security Group
aws ec2 create-security-group \
  --group-name green-matchers-sg \
  --description "Security group for Green Matchers"

# Allow SSH access
aws ec2 authorize-security-group-ingress \
  --group-name green-matchers-sg \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32

# Allow HTTP/HTTPS access
aws ec2 authorize-security-group-ingress \
  --group-name green-matchers-sg \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name green-matchers-sg \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Create DB Subnet Group
aws rds create-db-subnet-group \
  --db-subnet-group-name green-matchers-subnet-group \
  --subnet-ids subnet-1 subnet-2

# Create RDS Instance
aws rds create-db-instance \
  --db-instance-identifier green-matchers-db \
  --db-instance-class db.t3.micro \
  --engine mariadb \
  --engine-version 10.11 \
  --master-username admin \
  --master-user-password YOUR_DB_PASSWORD \
  --allocated-storage 20 \
  --storage-type gp2 \
  --vpc-security-group-ids green-matchers-sg \
  --db-subnet-group-name green-matchers-subnet-group \
  --backup-retention-period 7 \
  --multi-az \
  --publicly-accessible

# Get DB Endpoint
aws rds describe-db-instances \
  --db-instance-identifier green-matchers-db \
  --query "DBInstances[0].Endpoint.Address" \
  --output text
```

### Option B: Azure Database

```bash
# Create Resource Group
az group create \
  --name green-matchers-rg \
  --location eastus

# Create MariaDB Server
az mariadb server create \
  --name green-matchers-db \
  --resource-group green-matchers-rg \
  --location eastus \
  --admin-user admin \
  --admin-password YOUR_DB_PASSWORD \
  --sku-name B_Gen5_1 \
  --storage-size 5120 \
  --version 10.11 \
  --ssl-enforcement Enabled

# Get DB Connection String
az mariadb server show \
  --name green-matchers-db \
  --resource-group green-matchers-rg \
  --query "fullyQualifiedDomainName" \
  --output tsv
```

### Option C: DigitalOcean

```bash
# Create Database
doctl databases create green-matchers-db \
  --engine mariadb \
  --num-nodes 1 \
  --region nyc1 \
  --size db-s-1vcpu-1gb \
  --version 10.11

# Get Connection Details
doctl databases connection green-matchers-db
```

---

## Step 4: Deploy Backend

### Connect to Production Server

```bash
ssh user@YOUR_SERVER_IP
```

### Clone Repository

```bash
cd /var/www
git clone https://github.com/shivam499-pro/Green-Matcher-Project.git
cd Green-Matcher-Project
```

### Setup Backend Environment

```bash
cd apps/backend

# Copy production environment template
cp .env.production .env

# Edit .env with your production values
nano .env
```

**Update .env with:**
```env
# Database Configuration
DATABASE_URL=mariadb+pymysql://admin:YOUR_DB_PASSWORD@YOUR_DB_HOST:3306/green_matchers

# JWT Authentication
JWT_SECRET_KEY=YOUR_GENERATED_JWT_SECRET_HERE
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS Settings
CORS_ORIGINS=https://greenmatchers.com,https://www.greenmatchers.com

# Application Settings
APP_NAME=Green Matchers
APP_VERSION=1.0.0
APP_DESCRIPTION=AI-native green-jobs platform for India

# Environment
ENVIRONMENT=production

# Azure Key Vault (if using Azure)
AZURE_KEY_VAULT_URL=https://green-matchers-kv.vault.azure.net/
```

### Install Python Dependencies

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Create Systemd Service

```bash
sudo nano /etc/systemd/system/green-matchers-api.service
```

**Service Configuration:**
```ini
[Unit]
Description=Green Matchers API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/Green-Matcher-Project/apps/backend
Environment="PATH=/var/www/Green-Matcher-Project/apps/backend/venv/bin"
ExecStart=/var/www/Green-Matcher-Project/apps/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Start Backend Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable green-matchers-api

# Start service
sudo systemctl start green-matchers-api

# Check status
sudo systemctl status green-matchers-api

# View logs
sudo journalctl -u green-matchers-api -f
```

### Run Production Seed

```bash
cd /var/www/Green-Matcher-Project/apps/backend

# Set admin password
export ADMIN_PASSWORD="YOUR_GENERATED_ADMIN_PASSWORD_HERE"

# Run production seed
python scripts/seed_production.py
```

### Verify Backend

```bash
# Test health check
curl http://localhost:8000/health

# Test API docs
curl http://localhost:8000/docs

# Test admin login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@greenmatchers.com",
    "password": "YOUR_GENERATED_ADMIN_PASSWORD_HERE"
  }'
```

---

## Step 5: Deploy Frontend

### Build Frontend

```bash
cd /var/www/Green-Matcher-Project/apps/web

# Install dependencies
npm install

# Build for production
npm run build
```

### Deploy to Nginx

```bash
# Create frontend directory
sudo mkdir -p /var/www/green-matchers

# Copy build files
sudo cp -r dist/* /var/www/green-matchers/

# Set permissions
sudo chown -R www-data:www-data /var/www/green-matchers
sudo chmod -R 755 /var/www/green-matchers
```

---

## Step 6: Configure Nginx

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/green-matchers
```

**Nginx Configuration:**
```nginx
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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_http_version 1.1;
    }
}

# Frontend
server {
    listen 80;
    server_name greenmatchers.com www.greenmatchers.com;

    root /var/www/green-matchers;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### Enable Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/green-matchers /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

---

## Step 7: Setup SSL Certificate

### Option A: Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d greenmatchers.com -d www.greenmatchers.com -d api.greenmatchers.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Option B: Cloudflare

1. **Sign up for Cloudflare** at https://dash.cloudflare.com/sign-up
2. **Add your domain** to Cloudflare
3. **Update nameservers** to Cloudflare nameservers
4. **Enable "Always Use HTTPS"** in Cloudflare settings
5. **Configure SSL/TLS** to "Full" mode
6. **Add DNS records:**
   - A record: `greenmatchers.com` → YOUR_SERVER_IP
   - A record: `api.greenmatchers.com` → YOUR_SERVER_IP
   - CNAME record: `www.greenmatchers.com` → `greenmatchers.com`

---

## Step 8: Update Nginx for HTTPS

### Update Configuration for SSL

```bash
sudo nano /etc/nginx/sites-available/green-matchers
```

**HTTPS Configuration:**
```nginx
# Backend API
server {
    listen 443 ssl http2;
    server_name api.greenmatchers.com;

    ssl_certificate /etc/letsencrypt/live/api.greenmatchers.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.greenmatchers.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_http_version 1.1;
    }

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

# Frontend
server {
    listen 443 ssl http2;
    server_name greenmatchers.com www.greenmatchers.com;

    ssl_certificate /etc/letsencrypt/live/greenmatchers.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/greenmatchers.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/green-matchers;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name greenmatchers.com www.greenmatchers.com api.greenmatchers.com;
    return 301 https://$server_name$request_uri;
}
```

### Restart Nginx

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 9: Setup Monitoring

### Option A: AWS CloudWatch

```bash
# Install CloudWatch agent
sudo apt install amazon-cloudwatch-agent

# Create configuration
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/config.json
```

**CloudWatch Configuration:**
```json
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/www/Green-Matcher-Project/apps/backend/logs/app.log",
            "log_group_name": "green-matchers-api",
            "log_stream_name": "application"
          }
        ]
      }
    }
  }
}
```

```bash
# Start CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s green-matchers \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m
```

### Option B: Azure Monitor

```bash
# Install Azure Monitor agent
wget https://aka.ms/azuremonitoragent -O azuremonitoragent.deb
sudo dpkg -i azuremonitoragent.deb

# Configure agent
sudo /opt/microsoft/azuremonitoragent/bin/ama-cli.sh \
  --config \
  --workspace-id YOUR_WORKSPACE_ID \
  --key YOUR_KEY
```

---

## Step 10: Final Verification

### Test All Services

```bash
# Test Backend Health
curl https://api.greenmatchers.com/health

# Test Frontend
curl https://greenmatchers.com

# Test API Documentation
curl https://api.greenmatchers.com/docs

# Test Admin Login
curl -X POST https://api.greenmatchers.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@greenmatchers.com",
    "password": "YOUR_GENERATED_ADMIN_PASSWORD_HERE"
  }'

# Check SSL Certificate
curl -I https://greenmatchers.com
curl -I https://api.greenmatchers.com
```

### Check Services Status

```bash
# Check Backend Service
sudo systemctl status green-matchers-api

# Check Nginx Service
sudo systemctl status nginx

# Check Backend Logs
sudo journalctl -u green-matchers-api -n 50

# Check Nginx Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
sudo journalctl -u green-matchers-api -f

# Check port
sudo netstat -tlnp | grep 8000

# Check firewall
sudo ufw status
sudo ufw allow 8000/tcp
```

### Database Connection Issues

```bash
# Test database connection
mysql -h YOUR_DB_HOST -u admin -p green_matchers

# Check firewall
sudo ufw allow 3306/tcp
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Force renew
sudo certbot renew --force
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

---

## Deployment Checklist

Use this checklist to verify your deployment:

### Backend
- [ ] Backend service is running
- [ ] Health check endpoint returns 200 OK
- [ ] API documentation is accessible
- [ ] Admin user can login
- [ ] Database connection is working
- [ ] Logs are being written

### Frontend
- [ ] Frontend is accessible
- [ ] All pages load correctly
- [ ] API calls are working
- [ ] User can register and login
- [ ] Job search is working
- [ ] Career recommendations are working

### Security
- [ ] SSL certificate is valid
- [ ] HTTPS is enforced (HTTP redirects to HTTPS)
- [ ] Security headers are present
- [ ] CORS is configured correctly
- [ ] Firewall rules are in place

### Monitoring
- [ ] Logs are being collected
- [ ] Metrics are being tracked
- [ ] Alerts are configured
- [ ] Health checks are running

---

## Post-Deployment Tasks

After successful deployment:

1. **Monitor the application** for the first 24-48 hours
2. **Check error logs** regularly
3. **Test all user flows** (registration, login, job search, applications)
4. **Set up automated backups** for database
5. **Configure alerting** for critical errors
6. **Document any issues** and solutions
7. **Update documentation** with production-specific details

---

## Quick Reference

### Backend Service Commands
```bash
# Start
sudo systemctl start green-matchers-api

# Stop
sudo systemctl stop green-matchers-api

# Restart
sudo systemctl restart green-matchers-api

# Status
sudo systemctl status green-matchers-api

# Logs
sudo journalctl -u green-matchers-api -f
```

### Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Status
sudo systemctl status nginx

# Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Commands
```bash
# Connect
mysql -h YOUR_DB_HOST -u admin -p green_matchers

# Backup
mysqldump -u admin -p green_matchers > backup.sql

# Restore
mysql -u admin -p green_matchers < backup.sql
```

---

**Follow this script step by step to deploy your Green Matchers application to production!** 🚀

**For detailed step-by-step instructions, see [`PRODUCTION_DEPLOYMENT_NEXT_STEPS.md`](PRODUCTION_DEPLOYMENT_NEXT_STEPS.md)**
