# 📈 Scalability Strategy Guide

Complete scalability strategy for Green Matchers production deployment.

---

## 🎯 Overview

This guide provides a comprehensive scalability strategy to handle growth in users, jobs, careers, and applications while maintaining performance and reliability.

---

## 📊 Current Architecture

### Single Server Deployment (Current)

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
│                    (Nginx)                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Application Server                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  FastAPI Backend (uvicorn)                      │  │
│  │  - API endpoints                                │  │
│  │  - AI/ML services                               │  │
│  │  - Business logic                               │  │
│  └─────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────┐  │
│  │  React Frontend (Vite build)                    │  │
│  │  - Static files served by Nginx                 │  │
│  └─────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Database Server                            │
│              (MariaDB 10.11)                            │
│  - Vector embeddings (768-dim)                          │
│  - Relational data                                     │
└─────────────────────────────────────────────────────────┘
```

**Capacity:**
- **Users:** 1,000 - 5,000 concurrent
- **Jobs:** 10,000 - 50,000
- **Careers:** 1,000 - 5,000
- **Applications:** 100,000 - 500,000
- **API Requests:** 100 - 500 requests/second

---

## 🚀 Scalability Roadmap

### Phase 1: Optimization (Current - 1 Month)

**Goal:** Optimize current single-server deployment

**Actions:**
1. Enable database query caching
2. Implement Redis for session storage
3. Optimize database queries
4. Enable CDN for static assets
5. Implement database connection pooling

**Expected Capacity:**
- **Users:** 5,000 - 10,000 concurrent
- **API Requests:** 500 - 1,000 requests/second

---

### Phase 2: Horizontal Scaling (1 - 3 Months)

**Goal:** Add multiple application servers

**Actions:**
1. Deploy load balancer (AWS ALB or Nginx)
2. Add 2-3 application servers
3. Implement session affinity
4. Add Redis cluster for caching
5. Implement database read replicas

**Expected Capacity:**
- **Users:** 10,000 - 50,000 concurrent
- **API Requests:** 1,000 - 5,000 requests/second

---

### Phase 3: Database Scaling (3 - 6 Months)

**Goal:** Scale database layer

**Actions:**
1. Implement database sharding
2. Add write replicas
3. Implement database connection pooling
4. Optimize database indexes
5. Implement database caching

**Expected Capacity:**
- **Users:** 50,000 - 100,000 concurrent
- **API Requests:** 5,000 - 10,000 requests/second

---

### Phase 4: Microservices (6 - 12 Months)

**Goal:** Split into microservices

**Actions:**
1. Extract AI/ML services
2. Extract authentication service
3. Extract job matching service
4. Extract analytics service
5. Implement service mesh

**Expected Capacity:**
- **Users:** 100,000 - 500,000 concurrent
- **API Requests:** 10,000 - 50,000 requests/second

---

## 🔧 Scalability Strategies

### 1. Horizontal Scaling (Application Layer)

**Strategy:** Add more application servers behind a load balancer

**Implementation:**

#### AWS Application Load Balancer

```bash
# Create target group
aws elbv2 create-target-group \
  --name green-matchers-api \
  --protocol HTTP \
  --port 8000 \
  --vpc-id vpc-your-vpc-id \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 3 \
  --unhealthy-threshold-count 2

# Create load balancer
aws elbv2 create-load-balancer \
  --name green-matchers-alb \
  --subnets subnet-1 subnet-2 subnet-3 \
  --security-groups sg-your-security-group

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:region:account-id:loadbalancer/app/green-matchers-alb/your-id \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:region:account-id:targetgroup/green-matchers-api/your-id

# Register targets
aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:region:account-id:targetgroup/green-matchers-api/your-id \
  --targets Id=i-instance-1,Port=8000 Id=i-instance-2,Port=8000 Id=i-instance-3,Port=8000
```

#### Nginx Load Balancer

```nginx
# /etc/nginx/nginx.conf
upstream green_matchers_api {
    least_conn;
    server 10.0.1.10:8000 weight=3;
    server 10.0.1.11:8000 weight=3;
    server 10.0.1.12:8000 weight=2;
    keepalive 32;
}

server {
    listen 80;
    server_name api.greenmatchers.com;

    location / {
        proxy_pass http://green_matchers_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

---

### 2. Database Scaling

#### Strategy A: Read Replicas

```bash
# Create read replica in AWS RDS
aws rds create-db-instance-read-replica \
  --db-instance-identifier green-matchers-db-replica-1 \
  --source-db-instance-identifier green-matchers-db

# Update application to use read replicas for read queries
# Update apps/backend/core/config.py
DATABASE_URL_READ = "mariadb+pymysql://green_user:password@replica-host:3306/green_matchers"
```

#### Strategy B: Database Sharding

```python
# apps/backend/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Shard by user_id
def get_shard_database(user_id: int):
    shard_id = user_id % 3  # 3 shards
    shard_urls = {
        0: "mariadb+pymysql://green_user:password@shard-0:3306/green_matchers",
        1: "mariadb+pymysql://green_user:password@shard-1:3306/green_matchers",
        2: "mariadb+pymysql://green_user:password@shard-2:3306/green_matchers"
    }
    return create_engine(shard_urls[shard_id])

# Use in routes
def get_user_db(user_id: int):
    engine = get_shard_database(user_id)
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()
```

#### Strategy C: Connection Pooling

```python
# apps/backend/core/config.py
from sqlalchemy.pool import QueuePool

engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    pool_timeout=30,
    pool_recycle=3600,
    pool_pre_ping=True
)
```

---

### 3. Caching Strategy

#### Redis for Session Storage

```python
# apps/backend/core/cache.py
import redis
from fastapi import Request
from typing import Optional

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

async def get_session(request: Request) -> Optional[dict]:
    """Get session from Redis."""
    session_id = request.cookies.get('session_id')
    if not session_id:
        return None
    
    session_data = redis_client.get(f"session:{session_id}")
    if session_data:
        return json.loads(session_data)
    return None

async def set_session(request: Request, session_data: dict, expire: int = 3600):
    """Set session in Redis."""
    session_id = request.cookies.get('session_id')
    if not session_id:
        session_id = str(uuid.uuid4())
    
    redis_client.setex(
        f"session:{session_id}",
        expire,
        json.dumps(session_data)
    )
    return session_id
```

#### Redis for Query Caching

```python
# apps/backend/services/cache_service.py
import redis
import json
from typing import Optional, Any
from functools import wraps

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=1,
    decode_responses=True
)

def cache_result(ttl: int = 300):
    """Decorator to cache function results."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Try to get from cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result
            redis_client.setex(cache_key, ttl, json.dumps(result))
            
            return result
        return wrapper
    return decorator

# Usage
@cache_result(ttl=600)
async def get_careers(db: Session):
    """Get careers with caching."""
    return db.query(Career).all()
```

---

### 4. CDN for Static Assets

#### CloudFront CDN

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "green-matchers-$(date +%s)",
    "Comment": "Green Matchers CDN",
    "DefaultCacheBehavior": {
      "TargetOriginId": "green-matchers-origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "AllowedMethods": ["GET", "HEAD"],
      "CachedMethods": ["GET", "HEAD"],
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {"Forward": "none"}
      },
      "MinTTL": 0,
      "DefaultTTL": 86400,
      "MaxTTL": 31536000
    },
    "Origins": {
      "Items": [{
        "Id": "green-matchers-origin",
        "DomainName": "greenmatchers.com.s3.amazonaws.com",
        "S3OriginConfig": {"OriginAccessIdentity": ""}
      }],
      "Quantity": 1
    },
    "Enabled": true,
    "PriceClass": "PriceClass_All"
  }'
```

---

### 5. Asynchronous Processing

#### Celery for Background Tasks

```python
# apps/backend/core/celery_app.py
from celery import Celery

celery_app = Celery(
    "green_matchers",
    broker="redis://localhost:6379/2",
    backend="redis://localhost:6379/3"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)

# apps/backend/tasks/career_tasks.py
from core.celery_app import celery_app
from sqlalchemy.orm import Session
from utils.db import SessionLocal
from models.career import Career

@celery_app.task
def update_career_embeddings():
    """Update career embeddings in background."""
    db = SessionLocal()
    try:
        careers = db.query(Career).all()
        for career in careers:
            # Update embeddings
            career.embedding = generate_embedding(career.description)
        db.commit()
    finally:
        db.close()

# Usage in routes
from tasks.career_tasks import update_career_embeddings

@router.post("/careers/update-embeddings")
async def trigger_embedding_update():
    """Trigger background embedding update."""
    task = update_career_embeddings.delay()
    return {"task_id": task.id, "status": "started"}
```

---

### 6. AI/ML Service Scaling

#### Separate AI/ML Service

```python
# apps/ai-service/main.py
from fastapi import FastAPI
from sentence_transformers import SentenceTransformer
import numpy as np

app = FastAPI(title="Green Matchers AI Service")

# Load model once at startup
model = SentenceTransformer('all-mpnet-base-v2')

@app.post("/embed")
async def generate_embedding(text: str):
    """Generate embedding for text."""
    embedding = model.encode(text)
    return {"embedding": embedding.tolist()}

@app.post("/similarity")
async def calculate_similarity(embedding1: list, embedding2: list):
    """Calculate cosine similarity between embeddings."""
    vec1 = np.array(embedding1)
    vec2 = np.array(embedding2)
    similarity = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    return {"similarity": float(similarity)}
```

---

## 📊 Performance Optimization

### 1. Database Query Optimization

```python
# apps/backend/routes/jobs.py
from sqlalchemy.orm import joinedload

# Bad: N+1 query problem
@router.get("/jobs")
async def get_jobs(db: Session):
    jobs = db.query(Job).all()
    for job in jobs:
        # This causes N+1 queries
        employer = job.employer
    return jobs

# Good: Use joinedload
@router.get("/jobs")
async def get_jobs(db: Session):
    jobs = db.query(Job).options(joinedload(Job.employer)).all()
    return jobs
```

### 2. Pagination

```python
# apps/backend/routes/jobs.py
from typing import Optional

@router.get("/jobs")
async def get_jobs(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None
):
    """Get jobs with pagination."""
    query = db.query(Job)
    
    if search:
        query = query.filter(Job.title.ilike(f"%{search}%"))
    
    total = query.count()
    jobs = query.offset(skip).limit(limit).all()
    
    return {
        "jobs": jobs,
        "total": total,
        "skip": skip,
        "limit": limit
    }
```

### 3. Indexing

```python
# apps/backend/models/job.py
from sqlalchemy import Index

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    sdg_tag = Column(String(50), index=True)
    salary_min = Column(Integer, index=True)
    salary_max = Column(Integer, index=True)
    created_at = Column(DateTime, index=True)
    
    # Composite index
    __table_args__ = (
        Index('idx_job_sdg_salary', 'sdg_tag', 'salary_min', 'salary_max'),
        Index('idx_job_created', 'created_at'),
    )
```

---

## 🚀 Auto Scaling

### AWS Auto Scaling Group

```bash
# Create launch template
aws ec2 create-launch-template \
  --launch-template-name green-matchers-api \
  --launch-template-data '{
    "ImageId": "ami-your-image-id",
    "InstanceType": "t3.medium",
    "KeyName": "your-key-pair",
    "SecurityGroupIds": ["sg-your-security-group"],
    "UserData": "IyEvYmluL2Jhc2gKc3VkbyBhcHQtZ2V0IHVwZGF0ZQpzdWRvIGFwdC1nZXQgaW5zdGFsbCAteSBweXRob24zLjEzIHBpcCB2aXJ0dWFsZW52CmNkIC92YXIvd3d3L2dyZWVuLWF0Y2hlcnMKZ2l0IHB1bGwgb3JpZ2luIG1haW4KY2QgYXBwcy9iYWNrZW5kCnNvdXJjZSB2ZW52L2Jpbi9hY3RpdmF0ZQpwaXAgaW5zdGFsbCAtciByZXF1aXJlbWVudHMudHh0CnN1ZG8gc3lzdGVtY3RsIHN0YXJ0IGdyZWVuLWF0Y2hlcnMtYXBpCnN1ZG8gc3lzdGVtY3RsIGVuYWJsZSBncmVlbi1tYXRjaGVycy1hcGk="
  }'

# Create auto scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name green-matchers-api-asg \
  --launch-template "LaunchTemplateName=green-matchers-api" \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 3 \
  --target-group-arns arn:aws:elasticloadbalancing:region:account-id:targetgroup/green-matchers-api/your-id \
  --vpc-zone-identifier subnet-1,subnet-2,subnet-3

# Create scaling policy
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name green-matchers-api-asg \
  --policy-name scale-up-policy \
  --scaling-adjustment 1 \
  --adjustment-type ChangeInCapacity \
  --cooldown 300

aws autoscaling put-scaling-policy \
  --auto-scaling-group-name green-matchers-api-asg \
  --policy-name scale-down-policy \
  --scaling-adjustment -1 \
  --adjustment-type ChangeInCapacity \
  --cooldown 300
```

---

## 📈 Monitoring for Scalability

### Key Metrics to Monitor

1. **Application Metrics:**
   - Request rate
   - Response time (p50, p95, p99)
   - Error rate
   - CPU usage
   - Memory usage

2. **Database Metrics:**
   - Query performance
   - Connection pool usage
   - Replication lag
   - Disk I/O

3. **Cache Metrics:**
   - Hit rate
   - Memory usage
   - Eviction rate

4. **Business Metrics:**
   - Active users
   - Jobs posted
   - Applications submitted
   - Career recommendations

---

## 💰 Cost Optimization

### 1. Right-Sizing Instances

```bash
# Monitor instance utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-your-instance-id \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average

# If CPU < 20%, consider downsizing
# If CPU > 80%, consider upsizing
```

### 2. Reserved Instances

```bash
# Purchase reserved instances for predictable workloads
aws ec2 purchase-reserved-instances-offering \
  --reserved-instances-offering-id your-offering-id \
  --instance-count 3
```

### 3. Spot Instances

```bash
# Use spot instances for non-critical workloads
aws ec2 request-spot-fleet \
  --spot-fleet-request-config '{
    "IamFleetRole": "arn:aws:iam::account-id:role/aws-ec2-spot-fleet-tagging-role",
    "SpotPrice": "0.05",
    "TargetCapacity": 2,
    "LaunchSpecifications": [{
      "ImageId": "ami-your-image-id",
      "InstanceType": "t3.medium",
      "KeyName": "your-key-pair"
    }]
  }'
```

---

## 📚 Scalability Checklist

### Phase 1: Optimization
- [ ] Enable database query caching
- [ ] Implement Redis for session storage
- [ ] Optimize database queries
- [ ] Enable CDN for static assets
- [ ] Implement database connection pooling

### Phase 2: Horizontal Scaling
- [ ] Deploy load balancer
- [ ] Add 2-3 application servers
- [ ] Implement session affinity
- [ ] Add Redis cluster for caching
- [ ] Implement database read replicas

### Phase 3: Database Scaling
- [ ] Implement database sharding
- [ ] Add write replicas
- [ ] Implement database connection pooling
- [ ] Optimize database indexes
- [ ] Implement database caching

### Phase 4: Microservices
- [ ] Extract AI/ML services
- [ ] Extract authentication service
- [ ] Extract job matching service
- [ ] Extract analytics service
- [ ] Implement service mesh

---

## ✅ Summary

This scalability strategy provides:

- ✅ **Phase-based approach:** Gradual scaling from optimization to microservices
- ✅ **Multiple strategies:** Horizontal scaling, database scaling, caching, CDN
- ✅ **Auto scaling:** Automatic scaling based on demand
- ✅ **Cost optimization:** Right-sizing, reserved instances, spot instances
- ✅ **Monitoring:** Key metrics to track scalability
- ✅ **Roadmap:** Clear path from single server to microservices

**Scalability strategy is now ready for production deployment!** 🚀
