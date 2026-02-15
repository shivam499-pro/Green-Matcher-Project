# Green Matchers - Production Deployment Guide

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure you have:

- [ ] Production server (Linux - Ubuntu 22.04 LTS or similar)
- [ ] Domain name configured with DNS
- [ ] SSL certificate (Let's Encrypt recommended)
- [ ] MariaDB 10.11+ installed or managed database service
- [ ] Python 3.13+ installed
- [ ] Node.js 18+ installed
- [ ] Nginx installed
- [ ] Sufficient resources (minimum: 2 CPU cores, 4GB RAM, 20GB storage)

## 🚀 Deployment Options

Choose one of the following deployment methods:

### Option 1: Manual Deployment (Traditional)
### Option 2: Docker Deployment (Recommended)
### Option 3: Cloud Platform Deployment (AWS/Azure/GCP)

---

## Option 1: Manual Deployment

### Step 1: Prepare Production Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.13 python3.13-venv python3-pip
sudo apt install -y nodejs npm
sudo apt install -y mariadb-server mariadb-client
sudo apt install -y nginx certbot python3-certbot-nginx
sudo apt install -y git curl
```

### Step 2: Set Up Database

```bash
# Secure MariaDB installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE green_matchers CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'green_user'@'localhost' IDENTIFIED BY 'your-strong-password';
GRANT ALL PRIVILEGES ON green_matchers.* TO 'green_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Clone Repository

```bash
# Create deployment directory
sudo mkdir -p /var/www/green-matchers
sudo chown $USER:$USER /var/www/green-matchers
cd /var/www/green-matchers

# Clone your repository
git clone https://github.com/yourusername/green-matchers.git .
```

### Step 4: Configure Backend

```bash
cd /var/www/green-matchers/apps/backend

# Create virtual environment
python3.13 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Configure environment
cp .env.production .env.production.local
nano .env.production.local
```

Update `.env.production.local`:
```env
DATABASE_URL=mariadb+pymysql://green_user:your-strong-password@localhost:3306/green_matchers
JWT_SECRET_KEY=your-generated-secret-key
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
ENVIRONMENT=production
```

Generate JWT secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 5: Seed Database

```bash
# Run database seeding
python scripts/seed_database.py
```

### Step 6: Configure Frontend

```bash
cd /var/www/green-matchers/apps/web

# Install dependencies
npm install

# Update API endpoint in config
# Edit src/config.js or .env file with production API URL

# Build for production
npm run build
```

### Step 7: Configure Nginx

```bash
# Copy nginx configuration
sudo cp /var/www/green-matchers/nginx-config.conf /etc/nginx/sites-available/green-matchers

# Update domain in config
sudo nano /etc/nginx/sites-available/green-matchers
# Replace 'yourdomain.com' with your actual domain

# Enable site
sudo ln -s /etc/nginx/sites-available/green-matchers /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 8: Set Up SSL

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal:
sudo certbot renew --dry-run
```

### Step 9: Set Up Systemd Service

```bash
# Copy service file
sudo cp /var/www/green-matchers/green-matchers.service /etc/systemd/system/

# Update paths in service file if needed
sudo nano /etc/systemd/system/green-matchers.service

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable green-matchers
sudo systemctl start green-matchers

# Check status
sudo systemctl status green-matchers
```

### Step 10: Verify Deployment

```bash
# Check backend is running
curl http://localhost:8000/health

# Check frontend is accessible
curl https://yourdomain.com

# Check logs
sudo journalctl -u green-matchers -f
```

---

## Option 2: Docker Deployment

### Prerequisites

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose
```

### Deployment Steps

```bash
# Clone repository
git clone https://github.com/yourusername/green-matchers.git
cd green-matchers

# Configure environment
cp .env.docker .env
nano .env
# Update all values

# Build and start containers
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### Docker Management Commands

```bash
# Stop all containers
docker-compose down

# Restart services
docker-compose restart

# Update and redeploy
git pull
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Execute commands in container
docker-compose exec backend python scripts/seed_database.py
```

---

## Option 3: Cloud Platform Deployment

### AWS Deployment

#### Using EC2

1. Launch EC2 instance (Ubuntu 22.04, t3.medium or larger)
2. Configure Security Groups (ports 80, 443, 22)
3. Follow Manual Deployment steps above
4. Use RDS for MariaDB (recommended)
5. Use CloudFront for CDN (optional)

#### Using Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init -p python-3.13 green-matchers

# Create environment
eb create green-matchers-prod

# Deploy
eb deploy
```

### Azure Deployment

1. Create App Service (Python 3.13)
2. Create Azure Database for MariaDB
3. Configure Application Settings
4. Deploy using GitHub Actions or Azure CLI

### Google Cloud Platform

1. Create Compute Engine instance or use App Engine
2. Create Cloud SQL (MariaDB) instance
3. Configure firewall rules
4. Follow Manual Deployment steps

---

## 🔒 Security Hardening

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Fail2Ban (Protection against brute force)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Regular Updates

```bash
# Set up automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📊 Monitoring & Logging

### Application Logs

```bash
# Backend logs
sudo journalctl -u green-matchers -f

# Nginx access logs
sudo tail -f /var/log/nginx/green-matchers-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/green-matchers-error.log
```

### Set Up Monitoring (Optional)

Consider using:
- **Prometheus + Grafana** for metrics
- **ELK Stack** for log aggregation
- **Sentry** for error tracking
- **Uptime Robot** for uptime monitoring

---

## 🔄 Backup Strategy

### Database Backups

```bash
# Create backup script
cat > /usr/local/bin/backup-greenmatchers.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/green-matchers"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mysqldump -u green_user -p'your-password' green_matchers | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-greenmatchers.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-greenmatchers.sh") | crontab -
```

---

## 🚨 Rollback Strategy

### Quick Rollback

```bash
# Stop current version
sudo systemctl stop green-matchers

# Restore from backup
cd /var/www/green-matchers
git checkout [previous-commit-hash]

# Restore database if needed
gunzip < /var/backups/green-matchers/backup_YYYYMMDD.sql.gz | mysql -u green_user -p green_matchers

# Restart service
sudo systemctl start green-matchers
```

---

## 📈 Performance Optimization

### Nginx Caching

Already configured in nginx-config.conf for static assets.

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_job ON applications(job_id);
```

### Backend Scaling

Increase workers in systemd service:
```
ExecStart=/var/www/green-matchers/backend/venv/bin/uvicorn main:app --workers 8
```

---

## 🧪 Verification Tests

After deployment, test:

1. **Frontend Access**: https://yourdomain.com
2. **API Health**: https://yourdomain.com/api/health
3. **Login Flow**: Try logging in with test account
4. **Job Search**: Test semantic search functionality
5. **Database Connection**: Verify data loads correctly
6. **SSL Certificate**: Check SSL rating at ssllabs.com
7. **Performance**: Test with tools like GTmetrix or Lighthouse

---

## 📞 Support & Maintenance

### Common Issues

**Backend won't start:**
```bash
# Check logs
sudo journalctl -u green-matchers -n 50

# Verify .env.production
cat /var/www/green-matchers/apps/backend/.env.production

# Test database connection
python -c "from sqlalchemy import create_engine; engine = create_engine('your-db-url'); print(engine.connect())"
```

**Frontend not loading:**
```bash
# Check nginx status
sudo systemctl status nginx

# Verify build exists
ls -la /var/www/green-matchers/apps/web/dist

# Check nginx error log
sudo tail -f /var/log/nginx/green-matchers-error.log
```

---

## ✅ Post-Deployment Checklist

- [ ] Application is accessible via HTTPS
- [ ] SSL certificate is valid
- [ ] Database is backed up regularly
- [ ] Monitoring is set up
- [ ] Logs are being collected
- [ ] Firewall is configured
- [ ] Fail2ban is running
- [ ] Auto-updates are enabled
- [ ] Documentation is updated
- [ ] Team has access to production

---

## 📚 Additional Resources

- [FastAPI Deployment Documentation](https://fastapi.tiangolo.com/deployment/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [MariaDB Documentation](https://mariadb.com/kb/en/)

---

**Deployment Support:** For issues, check the troubleshooting section or open an issue on GitHub.
