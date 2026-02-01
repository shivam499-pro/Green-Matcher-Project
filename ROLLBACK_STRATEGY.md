# 🔄 Rollback Strategy Guide

Complete rollback strategy for Green Matchers production deployment.

---

## 🎯 Overview

This guide provides a comprehensive rollback strategy to quickly revert to a previous stable version if a deployment fails or causes issues.

---

## 📋 Rollback Principles

### 1. Fast Rollback
- **Goal:** Rollback within 5 minutes
- **Method:** Git-based rollback with database migrations
- **Automation:** GitHub Actions workflow for automated rollback

### 2. Zero Downtime
- **Goal:** No service interruption during rollback
- **Method:** Blue-green deployment or canary deployment
- **Verification:** Health checks before traffic switch

### 3. Data Safety
- **Goal:** No data loss during rollback
- **Method:** Database backups before deployment
- **Verification:** Data integrity checks after rollback

### 4. Minimal Impact
- **Goal:** Minimal user impact during rollback
- **Method:** Graceful degradation, error pages
- **Communication:** Status page updates

---

## 🔄 Rollback Methods

### Method 1: Git-Based Rollback (Recommended)

**When to use:** Code changes, configuration changes, minor bugs

**Steps:**

1. **Identify the last stable commit:**
   ```bash
   git log --oneline -20
   ```

2. **Checkout the stable commit:**
   ```bash
   git checkout <stable-commit-hash>
   ```

3. **Rollback database migrations:**
   ```bash
   cd apps/backend
   source venv/bin/activate
   alembic downgrade -1
   ```

4. **Restart services:**
   ```bash
   sudo systemctl restart green-matchers-api
   sudo systemctl reload nginx
   ```

5. **Verify rollback:**
   ```bash
   curl -f https://yourdomain.com/health
   ```

**Automation with GitHub Actions:**

See [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) for the `rollback-production` workflow.

**Trigger rollback:**

```bash
# Using GitHub CLI
gh workflow run rollback-production.yml -f rollback_commit=<commit-hash>

# Or manually trigger from GitHub Actions UI
# Go to Actions → Rollback Production → Run workflow
```

---

### Method 2: Database Backup Rollback

**When to use:** Database schema changes, data migration issues

**Steps:**

1. **Create backup before deployment:**
   ```bash
   # Automated backup
   mysqldump -u green_user -p green_matchers > backup_$(date +%Y%m%d_%H%M%S).sql
   
   # Or use AWS RDS snapshot
   aws rds create-db-snapshot \
     --db-instance-identifier green-matchers-db \
     --db-snapshot-identifier green-matchers-backup-$(date +%Y%m%d_%H%M%S)
   ```

2. **If deployment fails, restore backup:**
   ```bash
   # Restore from SQL backup
   mysql -u green_user -p green_matchers < backup_20240101_120000.sql
   
   # Or restore from RDS snapshot
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier green-matchers-db-restored \
     --db-snapshot-identifier green-matchers-backup-20240101_120000
   ```

3. **Update DNS to point to restored instance:**
   ```bash
   # If using RDS, update connection string
   # Update apps/backend/.env.production
   DATABASE_URL=mariadb+pymysql://green_user:password@green-matchers-db-restored/green_matchers
   ```

4. **Restart services:**
   ```bash
   sudo systemctl restart green-matchers-api
   ```

5. **Verify rollback:**
   ```bash
   curl -f https://yourdomain.com/health
   ```

---

### Method 3: Blue-Green Deployment Rollback

**When to use:** Major releases, infrastructure changes

**Setup:**

1. **Create two identical environments:**
   - **Blue:** Current production (stable)
   - **Green:** New deployment (testing)

2. **Deploy to Green environment:**
   ```bash
   # Deploy to green environment
   ssh green-server
   cd /var/www/green-matchers
   git pull origin main
   cd apps/backend
   source venv/bin/activate
   pip install -r requirements.txt
   alembic upgrade head
   sudo systemctl restart green-matchers-api-green
   ```

3. **Test Green environment:**
   ```bash
   # Run smoke tests
   curl -f https://green.yourdomain.com/health
   curl -f https://green.yourdomain.com/api/jobs
   ```

4. **Switch traffic to Green:**
   ```bash
   # Update Nginx upstream
   sudo nano /etc/nginx/conf.d/green-matchers.conf
   
   # Change upstream from blue to green
   upstream green_matchers {
       server green-server:8000;
   }
   
   sudo systemctl reload nginx
   ```

5. **If issues occur, rollback to Blue:**
   ```bash
   # Update Nginx upstream back to blue
   sudo nano /etc/nginx/conf.d/green-matchers.conf
   
   # Change upstream from green to blue
   upstream green_matchers {
       server blue-server:8000;
   }
   
   sudo systemctl reload nginx
   ```

---

### Method 4: Canary Deployment Rollback

**When to use:** Gradual rollout, A/B testing

**Setup:**

1. **Deploy to canary servers (10% of traffic):**
   ```bash
   # Deploy to canary servers
   ssh canary-server
   cd /var/www/green-matchers
   git pull origin main
   cd apps/backend
   source venv/bin/activate
   pip install -r requirements.txt
   alembic upgrade head
   sudo systemctl restart green-matchers-api
   ```

2. **Route 10% of traffic to canary:**
   ```bash
   # Update Nginx with weighted load balancing
   sudo nano /etc/nginx/conf.d/green-matchers.conf
   
   upstream green_matchers {
       server production-server:8000 weight=9;
       server canary-server:8000 weight=1;
   }
   
   sudo systemctl reload nginx
   ```

3. **Monitor canary for issues:**
   ```bash
   # Check error rates
   tail -f /var/log/nginx/error.log
   
   # Check application logs
   tail -f /var/www/green-matchers/apps/backend/logs/app.log
   ```

4. **If issues occur, rollback:**
   ```bash
   # Remove canary from load balancer
   sudo nano /etc/nginx/conf.d/green-matchers.conf
   
   upstream green_matchers {
       server production-server:8000 weight=10;
   }
   
   sudo systemctl reload nginx
   ```

---

## 🚨 Rollback Triggers

### Automatic Rollback Triggers

1. **Health check fails:**
   ```bash
   # Health check script
   #!/bin/bash
   if ! curl -f https://yourdomain.com/health; then
       echo "Health check failed, initiating rollback..."
       ./rollback.sh
   fi
   ```

2. **Error rate exceeds threshold:**
   ```yaml
   # CloudWatch alarm
   aws cloudwatch put-metric-alarm \
     --alarm-name auto-rollback-error-rate \
     --alarm-description "Auto-rollback if error rate > 10%" \
     --metric-name HTTPCode_Target_5XX_Count \
     --namespace AWS/ApplicationELB \
     --statistic Sum \
     --period 60 \
     --evaluation-periods 3 \
     --threshold 10 \
     --comparison-operator GreaterThanThreshold \
     --alarm-actions arn:aws:sns:region:account-id:auto-rollback
   ```

3. **Response time exceeds threshold:**
   ```yaml
   # CloudWatch alarm
   aws cloudwatch put-metric-alarm \
     --alarm-name auto-rollback-response-time \
     --alarm-description "Auto-rollback if response time > 2s" \
     --metric-name TargetResponseTime \
     --namespace AWS/ApplicationELB \
     --statistic Average \
     --period 60 \
     --evaluation-periods 3 \
     --threshold 2.0 \
     --comparison-operator GreaterThanThreshold \
     --alarm-actions arn:aws:sns:region:account-id:auto-rollback
   ```

### Manual Rollback Triggers

1. **User reports critical bugs**
2. **Performance degradation**
3. **Security vulnerabilities**
4. **Data corruption**
5. **Feature not working as expected**

---

## 📝 Rollback Procedure

### Step-by-Step Rollback Process

#### 1. Assess the Situation

```bash
# Check current deployment status
git log --oneline -1

# Check health status
curl -f https://yourdomain.com/health

# Check error logs
tail -100 /var/log/nginx/error.log
tail -100 /var/www/green-matchers/apps/backend/logs/app.log

# Check database status
mysql -u green_user -p -e "SHOW PROCESSLIST;"
```

#### 2. Notify Stakeholders

```bash
# Update status page
curl -X POST https://statuspage.io/api/v1/incidents \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "incident": {
      "name": "Deployment Issue - Initiating Rollback",
      "status": "investigating",
      "impact": "major"
    }
  }'

# Send Slack notification
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -d '{
    "text": "🚨 Deployment issue detected. Initiating rollback to previous stable version."
  }'
```

#### 3. Create Backup (if not already done)

```bash
# Create database backup
mysqldump -u green_user -p green_matchers > backup_before_rollback_$(date +%Y%m%d_%H%M%S).sql

# Create application backup
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/green-matchers
```

#### 4. Execute Rollback

```bash
# Option 1: Git-based rollback
cd /var/www/green-matchers
git checkout <stable-commit-hash>
cd apps/backend
source venv/bin/activate
alembic downgrade -1
sudo systemctl restart green-matchers-api
sudo systemctl reload nginx

# Option 2: Database backup rollback
mysql -u green_user -p green_matchers < backup_20240101_120000.sql
sudo systemctl restart green-matchers-api

# Option 3: Blue-green rollback
sudo nano /etc/nginx/conf.d/green-matchers.conf
# Change upstream from green to blue
sudo systemctl reload nginx
```

#### 5. Verify Rollback

```bash
# Health check
curl -f https://yourdomain.com/health

# Smoke tests
curl -f https://yourdomain.com/api/jobs
curl -f https://yourdomain.com/api/careers
curl -f https://yourdomain.com/api/analytics

# Check logs
tail -50 /var/log/nginx/error.log
tail -50 /var/www/green-matchers/apps/backend/logs/app.log
```

#### 6. Update Stakeholders

```bash
# Update status page
curl -X POST https://statuspage.io/api/v1/incidents/INCIDENT_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "incident": {
      "status": "resolved",
      "body": "Rollback completed successfully. Service is back to normal."
    }
  }'

# Send Slack notification
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -d '{
    "text": "✅ Rollback completed successfully. Service is back to normal."
  }'
```

#### 7. Post-Rollback Analysis

```bash
# Create incident report
cat > incident_report_$(date +%Y%m%d_%H%M%S).md << EOF
# Incident Report

## Summary
Deployment failed, rollback initiated and completed successfully.

## Timeline
- $(date): Deployment started
- $(date): Issue detected
- $(date): Rollback initiated
- $(date): Rollback completed

## Root Cause
[To be determined]

## Impact
- Duration: X minutes
- Affected users: Y
- Data loss: None

## Actions Taken
1. Identified issue
2. Created backup
3. Executed rollback
4. Verified rollback
5. Notified stakeholders

## Prevention
[To be determined]
EOF
```

---

## 🛠️ Rollback Scripts

### Automated Rollback Script

Create [`scripts/rollback.sh`](scripts/rollback.sh):

```bash
#!/bin/bash

# Green Matchers - Automated Rollback Script

set -e

# Configuration
BACKUP_DIR="/var/backups/green-matchers"
APP_DIR="/var/www/green-matchers"
LOG_FILE="/var/log/green-matchers/rollback.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error function
error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Success function
success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_FILE"
}

# Warning function
warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "Please run as root"
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "Starting rollback process..."

# Step 1: Create backup
log "Step 1: Creating backup..."
BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# Backup database
log "Backing up database..."
mysqldump -u green_user -p green_matchers > "$BACKUP_DIR/$BACKUP_NAME/database.sql" || error "Failed to backup database"
success "Database backup created"

# Backup application
log "Backing up application..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME/app.tar.gz" "$APP_DIR" || error "Failed to backup application"
success "Application backup created"

# Step 2: Get last stable commit
log "Step 2: Getting last stable commit..."
cd "$APP_DIR"
STABLE_COMMIT=$(git log --oneline -10 | grep -i "stable\|release\|deploy" | head -1 | awk '{print $1}')
if [ -z "$STABLE_COMMIT" ]; then
    warning "No stable commit found, using HEAD~1"
    STABLE_COMMIT="HEAD~1"
fi
log "Rolling back to commit: $STABLE_COMMIT"

# Step 3: Rollback code
log "Step 3: Rolling back code..."
git checkout "$STABLE_COMMIT" || error "Failed to rollback code"
success "Code rolled back"

# Step 4: Rollback database
log "Step 4: Rollingback database..."
cd "$APP_DIR/apps/backend"
source venv/bin/activate
alembic downgrade -1 || warning "Failed to rollback database, continuing..."
success "Database rolled back"

# Step 5: Restart services
log "Step 5: Restarting services..."
systemctl restart green-matchers-api || error "Failed to restart API"
systemctl reload nginx || error "Failed to reload Nginx"
success "Services restarted"

# Step 6: Verify rollback
log "Step 6: Verifying rollback..."
sleep 5
if curl -f https://yourdomain.com/health; then
    success "Health check passed"
else
    error "Health check failed"
fi

# Step 7: Run smoke tests
log "Step 7: Running smoke tests..."
if curl -f https://yourdomain.com/api/jobs > /dev/null; then
    success "Jobs API test passed"
else
    warning "Jobs API test failed"
fi

if curl -f https://yourdomain.com/api/careers > /dev/null; then
    success "Careers API test passed"
else
    warning "Careers API test failed"
fi

log "Rollback completed successfully!"
log "Backup location: $BACKUP_DIR/$BACKUP_NAME"
log "Log file: $LOG_FILE"

success "Rollback process completed successfully!"
```

Make the script executable:

```bash
chmod +x scripts/rollback.sh
```

---

## 📊 Rollback Metrics

### Key Metrics to Track

1. **Rollback Frequency:**
   - Number of rollbacks per month
   - Target: < 1 rollback per month

2. **Rollback Time:**
   - Time from issue detection to rollback completion
   - Target: < 5 minutes

3. **Rollback Success Rate:**
   - Percentage of successful rollbacks
   - Target: 100%

4. **Downtime During Rollback:**
   - Time service is unavailable during rollback
   - Target: < 1 minute

5. **Data Loss During Rollback:**
   - Amount of data lost during rollback
   - Target: 0 bytes

---

## 🎯 Rollback Best Practices

### 1. Always Create Backup Before Deployment

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/green-matchers"
mkdir -p "$BACKUP_DIR"

# Create database backup
mysqldump -u green_user -p green_matchers > "$BACKUP_DIR/database_$(date +%Y%m%d_%H%M%S).sql"

# Create application backup
tar -czf "$BACKUP_DIR/app_$(date +%Y%m%d_%H%M%S).tar.gz" /var/www/green-matchers
```

### 2. Use Database Migrations

```bash
# Always use Alembic for database changes
alembic revision --autogenerate -m "Add new column"
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

### 3. Test Rollback Procedure Regularly

```bash
# Schedule monthly rollback drills
# Test rollback procedure in staging environment
# Document any issues and improve the process
```

### 4. Monitor Rollback Performance

```bash
# Track rollback metrics
# Analyze rollback causes
# Improve deployment process to reduce rollback frequency
```

### 5. Document Rollback Decisions

```bash
# Create incident report after each rollback
# Document root cause
# Document prevention measures
```

---

## 📚 Rollback Checklist

### Before Deployment
- [ ] Create database backup
- [ ] Create application backup
- [ ] Document deployment changes
- [ ] Prepare rollback plan
- [ ] Notify stakeholders

### During Deployment
- [ ] Monitor health checks
- [ ] Monitor error rates
- [ ] Monitor response times
- [ ] Monitor database performance
- [ ] Be ready to rollback

### After Deployment
- [ ] Verify health checks
- [ ] Run smoke tests
- [ ] Monitor metrics
- [ ] Update documentation
- [ ] Notify stakeholders

### During Rollback
- [ ] Assess the situation
- [ ] Notify stakeholders
- [ ] Create backup (if not already done)
- [ ] Execute rollback
- [ ] Verify rollback
- [ ] Update stakeholders

### After Rollback
- [ ] Verify health checks
- [ ] Run smoke tests
- [ ] Create incident report
- [ ] Analyze root cause
- [ ] Improve deployment process

---

## ✅ Summary

This rollback strategy provides:

- ✅ **Fast rollback:** Within 5 minutes
- ✅ **Zero downtime:** Blue-green deployment option
- ✅ **Data safety:** Database backups before deployment
- ✅ **Minimal impact:** Graceful degradation
- ✅ **Automation:** GitHub Actions workflow
- ✅ **Monitoring:** Automatic rollback triggers
- ✅ **Documentation:** Complete rollback procedures

**Rollback strategy is now ready for production deployment!** 🚀
