# 🚀 Production Deployment - Next Steps

Complete step-by-step guide for deploying Green Matchers to production.

---

## Step 1: Generate Strong JWT_SECRET_KEY

### Option A: Using Python
```bash
cd apps/backend
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Option B: Using OpenSSL
```bash
openssl rand -base64 32
```

### Option C: Using PowerShell
```powershell
Add-Type -AssemblyName System.Security
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Save the Generated Key
Copy the generated key and save it securely. You'll need it for:
- Environment variable: `JWT_SECRET_KEY`
- Secrets manager: `green-matchers/jwt-secret`

---

## Step 2: Set Up Secrets Manager

### Option A: AWS Secrets Manager

**Prerequisites:**
- AWS CLI installed
- AWS credentials configured (`aws configure`)

**Create Secrets:**
```bash
# JWT Secret
aws secretsmanager create-secret \
  --name green-matchers/jwt-secret \
  --secret-string "your-generated-jwt-secret-here"

# Database URL Secret
aws secretsmanager create-secret \
  --name green-matchers/database-url \
  --secret-string "mariadb+pymysql://admin:your-password@your-db-host:3306/green_matchers"

# Admin Password Secret
aws secretsmanager create-secret \
  --name green-matchers/admin-password \
  --secret-string "your-strong-admin-password"
```

**Verify Secrets:**
```bash
aws secretsmanager describe-secret --secret-id green-matchers/jwt-secret
```

### Option B: Azure Key Vault

**Prerequisites:**
- Azure CLI installed
- Azure credentials configured (`az login`)

**Create Key Vault:**
```bash
az keyvault create \
  --name green-matchers-kv \
  --resource-group green-matchers-rg \
  --location eastus
```

**Create Secrets:**
```bash
# JWT Secret
az keyvault secret set \
  --vault-name green-matchers-kv \
  --name jwt-secret \
  --value "your-generated-jwt-secret-here"

# Database URL Secret
az keyvault secret set \
  --vault-name green-matchers-kv \
  --name database-url \
  --value "mariadb+pymysql://admin:your-password@your-db-host:3306/green_matchers"

# Admin Password Secret
az keyvault secret set \
  --vault-name green-matchers-kv \
  --name admin-password \
  --value "your-strong-admin-password"
```

**Verify Secrets:**
```bash
az keyvault secret show --vault-name green-matchers-kv --name jwt-secret
```

---

## Step 3: Create Production Database

### Option A: AWS RDS (MariaDB)

**Create Database Instance:**
```bash
aws rds create-db-instance \
  --db-instance-identifier green-matchers-db \
  --db-instance-class db.t3.micro \
  --engine mariadb \
  --engine-version 10.11 \
  --master-username admin \
  --master-user-password YourStrongPassword123! \
  --allocated-storage 20 \
  --storage-type gp2 \
  --vpc-security-group-ids sg-xxxxxxxx \
  --db-subnet-group-name green-matchers-subnet-group \
  --backup-retention-period 7 \
  --multi-az \
  --publicly-accessible
```

**Get Database Endpoint:**
```bash
aws rds describe-db-instances \
  --db-instance-identifier green-matchers-db \
  --query "DBInstances[0].Endpoint.Address" \
  --output text
```

**Create Database:**
```bash
mysql -h <endpoint> -u admin -p
CREATE DATABASE green_matchers;
```

### Option B: Azure Database for MariaDB

**Create Resource Group:**
```bash
az group create \
  --name green-matchers-rg \
  --location eastus
```

**Create MariaDB Server:**
```bash
az mariadb server create \
  --name green-matchers-db \
  --resource-group green-matchers-rg \
  --location eastus \
  --admin-user admin \
  --admin-password YourStrongPassword123! \
  --sku-name B_Gen5_1 \
  --storage-size 5120 \
  --version 10.11
```

**Get Database Connection String:**
```bash
az mariadb server show \
  --name green-matchers-db \
  --resource-group green-matchers-rg \
  --query "fullyQualifiedDomainName" \
  --output tsv
```

**Create Database:**
```bash
mysql -h <domain> -u admin@green-matchers-db -p
CREATE DATABASE green_matchers;
```

### Option C: DigitalOcean Managed Database

**Create Database:**
```bash
doctl databases create green-matchers-db \
  --engine mariadb \
  --num-nodes 1 \
  --region nyc1 \
  --size db-s-1vcpu-1gb \
  --version 10.11
```

**Get Database Connection Details:**
```bash
doctl databases connection green-matchers-db
```

---

## Step 4: Update .env.production with Production Values

### Create Production Environment File
```bash
cd apps/backend
cp .env.production .env
```

### Update .env File
Edit the `.env` file with your production values:

```env
# Database Configuration
DATABASE_URL=mariadb+pymysql://admin:YourStrongPassword123!@your-db-host:3306/green_matchers

# JWT Authentication
JWT_SECRET_KEY=your-generated-jwt-secret-here
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

# Azure Key Vault (if using Azure)
AZURE_KEY_VAULT_URL=https://green-matchers-kv.vault.azure.net/
```

---

## Step 5: Deploy Backend to Production Server

### Option A: Using SSH and Systemd

**Connect to Server:**
```bash
ssh user@your-server-ip
```

**Clone Repository:**
```bash
cd /var/www
git clone https://github.com/shivam499-pro/Green-Matcher-Project.git
cd Green-Matcher-Project/apps/backend
```

**Install Dependencies:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Create Systemd Service:**
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

[Install]
WantedBy=multi-user.target
```

**Start Service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable green-matchers-api
sudo systemctl start green-matchers-api
sudo systemctl status green-matchers-api
```

### Option B: Using Docker

**Create Dockerfile:**
```dockerfile
FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and Run:**
```bash
docker build -t green-matchers-api .
docker run -d -p 8000:8000 --name green-matchers-api green-matchers-api
```

---

## Step 6: Deploy Frontend to Production Server

### Build Frontend
```bash
cd apps/web
npm install
npm run build
```

### Deploy to Server

**Option A: Using Nginx**
```bash
# Copy build files to server
scp -r dist/* user@your-server-ip:/var/www/green-matchers/

# On server
ssh user@your-server-ip
sudo chown -R www-data:www-data /var/www/green-matchers
```

**Option B: Using Vercel**
```bash
npm install -g vercel
cd apps/web
vercel --prod
```

**Option C: Using Netlify**
```bash
npm install -g netlify-cli
cd apps/web
netlify deploy --prod --dir=dist
```

---

## Step 7: Configure Nginx Reverse Proxy

### Install Nginx
```bash
sudo apt update
sudo apt install nginx
```

### Create Configuration File
```bash
sudo nano /etc/nginx/sites-available/green-matchers
```

### Nginx Configuration
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
sudo ln -s /etc/nginx/sites-available/green-matchers /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 8: Obtain SSL Certificate

### Option A: Using Certbot (Let's Encrypt)

**Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
```

**Obtain Certificate:**
```bash
sudo certbot --nginx -d greenmatchers.com -d www.greenmatchers.com -d api.greenmatchers.com
```

**Auto-Renewal:**
```bash
sudo certbot renew --dry-run
```

**Update Nginx Configuration for HTTPS:**
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

### Option B: Using Cloudflare

1. Sign up for Cloudflare
2. Add your domain to Cloudflare
3. Update nameservers to Cloudflare nameservers
4. Enable "Always Use HTTPS" in Cloudflare settings
5. Configure SSL/TLS to "Full" mode
6. Add DNS records:
   - A record: `greenmatchers.com` → your server IP
   - A record: `api.greenmatchers.com` → your server IP
   - CNAME record: `www.greenmatchers.com` → `greenmatchers.com`

---

## Step 9: Run Production Seed Script

### Set Admin Password
```bash
export ADMIN_PASSWORD="YourStrongAdminPassword123!"
```

### Run Production Seed
```bash
cd apps/backend
python scripts/seed_production.py
```

### Verify Admin User Created
```bash
# Test admin login
curl -X POST https://api.greenmatchers.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@greenmatchers.com",
    "password": "YourStrongAdminPassword123!"
  }'
```

---

## Step 10: Set Up Monitoring

### Option A: AWS CloudWatch

**Install CloudWatch Agent:**
```bash
sudo apt install amazon-cloudwatch-agent
```

**Create Configuration:**
```bash
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/config.json
```

**Configuration:**
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

**Start Agent:**
```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s green-matchers \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m
```

### Option B: Azure Monitor

**Install Azure Monitor Agent:**
```bash
wget https://aka.ms/azuremonitoragent -O azuremonitoragent.deb
sudo dpkg -i azuremonitoragent.deb
```

**Configure Agent:**
```bash
sudo /opt/microsoft/azuremonitoragent/bin/ama-cli.sh \
  --config \
  --workspace-id <workspace-id> \
  --key <key>
```

### Option C: Datadog

**Install Datadog Agent:**
```bash
DD_API_KEY=your-datadog-api-key bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
```

**Configure Application Monitoring:**
```python
# Add to apps/backend/main.py
from ddtrace import tracer

app = FastAPI()

@app.get("/")
@tracer.wrap("root_endpoint")
def root():
    return {"message": "Welcome to Green Matchers API"}
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] Backend API is accessible at `https://api.greenmatchers.com`
- [ ] Frontend is accessible at `https://greenmatchers.com`
- [ ] SSL certificates are valid
- [ ] Health check endpoint returns 200 OK
- [ ] Admin user can login
- [ ] Database connection is working
- [ ] Logs are being collected
- [ ] Security headers are present

### Test Health Check
```bash
curl https://api.greenmatchers.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "green-matchers-api",
  "version": "1.0.0"
}
```

### Test API Documentation
```bash
curl https://api.greenmatchers.com/docs
```

---

## Troubleshooting

### Backend Not Starting
```bash
# Check logs
sudo journalctl -u green-matchers-api -f

# Check port
sudo netstat -tlnp | grep 8000
```

### Database Connection Issues
```bash
# Test database connection
mysql -h <db-host> -u admin -p green_matchers

# Check firewall
sudo ufw status
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew
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

## Security Best Practices

1. **Never commit secrets to git**
2. **Use strong passwords** (minimum 16 characters, mixed case, numbers, symbols)
3. **Enable HTTPS only** (redirect HTTP to HTTPS)
4. **Keep software updated** (OS, Python, Nginx, MariaDB)
5. **Monitor logs regularly** for suspicious activity
6. **Use firewall rules** to restrict access
7. **Enable automatic backups** for database
8. **Rotate secrets regularly** (every 90 days)
9. **Use separate environments** (development, staging, production)
10. **Implement rate limiting** on API endpoints

---

**Follow this guide step by step to deploy your Green Matchers application to production!** 🚀
