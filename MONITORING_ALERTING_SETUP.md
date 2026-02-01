# 📊 Monitoring & Alerting Setup Guide

Complete monitoring and alerting configuration for Green Matchers production deployment.

---

## 🎯 Overview

This guide covers setting up comprehensive monitoring and alerting for the Green Matchers platform to ensure high availability and quick issue detection.

---

## 📋 Monitoring Stack

### Recommended Options

#### Option 1: AWS CloudWatch (Recommended for AWS)
- **Cost:** Free tier available, then pay-as-you-go
- **Features:** Metrics, logs, alarms, dashboards
- **Integration:** Native with AWS services

#### Option 2: Datadog (All-in-one)
- **Cost:** Free tier for 5 hosts
- **Features:** APM, logs, metrics, synthetics
- **Integration:** Easy setup with agents

#### Option 3: Prometheus + Grafana (Open Source)
- **Cost:** Free (self-hosted)
- **Features:** Metrics, dashboards, alerting
- **Integration:** Requires more setup

---

## 🔧 AWS CloudWatch Setup

### 1. Create CloudWatch Log Groups

```bash
# Backend API logs
aws logs create-log-group --log-group-name /green-matchers/backend/api

# Backend application logs
aws logs create-log-group --log-group-name /green-matchers/backend/app

# Nginx access logs
aws logs create-log-group --log-group-name /green-matchers/nginx/access

# Nginx error logs
aws logs create-log-group --log-group-name /green-matchers/nginx/error
```

### 2. Configure Log Retention

```bash
# Set 30-day retention for all log groups
aws logs put-retention-policy \
  --log-group-name /green-matchers/backend/api \
  --retention-in-days 30

aws logs put-retention-policy \
  --log-group-name /green-matchers/backend/app \
  --retention-in-days 30

aws logs put-retention-policy \
  --log-group-name /green-matchers/nginx/access \
  --retention-in-days 30

aws logs put-retention-policy \
  --log-group-name /green-matchers/nginx/error \
  --retention-in-days 30
```

### 3. Create CloudWatch Alarms

#### Alarm 1: API Error Rate High

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name green-matchers-api-error-rate-high \
  --alarm-description "Alert when API error rate exceeds 5%" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=LoadBalancer,Value=your-load-balancer-arn
```

#### Alarm 2: CPU Usage High

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name green-matchers-cpu-high \
  --alarm-description "Alert when CPU usage exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=i-your-instance-id
```

#### Alarm 3: Memory Usage High

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name green-matchers-memory-high \
  --alarm-description "Alert when memory usage exceeds 85%" \
  --metric-name MemoryUtilization \
  --namespace System/Linux \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 85 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=i-your-instance-id
```

#### Alarm 4: Database Connection Pool Exhausted

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name green-matchers-db-connections-high \
  --alarm-description "Alert when DB connections exceed 80%" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=DBInstanceIdentifier,Value=green-matchers-db
```

#### Alarm 5: API Response Time High

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name green-matchers-api-response-time-high \
  --alarm-description "Alert when API response time exceeds 1 second" \
  --metric-name TargetResponseTime \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 1.0 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=LoadBalancer,Value=your-load-balancer-arn
```

### 4. Create CloudWatch Dashboard

```bash
aws cloudwatch put-dashboard \
  --dashboard-name green-matchers-dashboard \
  --dashboard-body '{
    "widgets": [
      {
        "type": "metric",
        "x": 0,
        "y": 0,
        "width": 12,
        "height": 6,
        "properties": {
          "metrics": [
            ["AWS/ApplicationELB", "RequestCount", {"stat": "Sum"}],
            [".", "HTTPCode_Target_2XX_Count", {"stat": "Sum"}],
            [".", "HTTPCode_Target_4XX_Count", {"stat": "Sum"}],
            [".", "HTTPCode_Target_5XX_Count", {"stat": "Sum"}]
          ],
          "period": 300,
          "stat": "Sum",
          "region": "us-east-1",
          "title": "API Requests"
        }
      },
      {
        "type": "metric",
        "x": 0,
        "y": 6,
        "width": 6,
        "height": 6,
        "properties": {
          "metrics": [
            ["AWS/EC2", "CPUUtilization", {"stat": "Average"}]
          ],
          "period": 300,
          "stat": "Average",
          "region": "us-east-1",
          "title": "CPU Usage"
        }
      },
      {
        "type": "metric",
        "x": 6,
        "y": 6,
        "width": 6,
        "height": 6,
        "properties": {
          "metrics": [
            ["System/Linux", "MemoryUtilization", {"stat": "Average"}]
          ],
          "period": 300,
          "stat": "Average",
          "region": "us-east-1",
          "title": "Memory Usage"
        }
      },
      {
        "type": "metric",
        "x": 0,
        "y": 12,
        "width": 12,
        "height": 6,
        "properties": {
          "metrics": [
            ["AWS/RDS", "DatabaseConnections", {"stat": "Average"}],
            [".", "FreeStorageSpace", {"stat": "Average"}]
          ],
          "period": 300,
          "stat": "Average",
          "region": "us-east-1",
          "title": "Database Metrics"
        }
      }
    ]
  }'
```

### 5. Configure SNS Topic for Alerts

```bash
# Create SNS topic
aws sns create-topic --name green-matchers-alerts

# Subscribe email to SNS topic
aws sns subscribe \
  --topic-arn arn:aws:sns:region:account-id:green-matchers-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com

# Subscribe Slack webhook to SNS topic
aws sns subscribe \
  --topic-arn arn:aws:sns:region:account-id:green-matchers-alerts \
  --protocol https \
  --notification-endpoint https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 6. Attach SNS Topic to Alarms

```bash
# Get SNS topic ARN
TOPIC_ARN=$(aws sns list-topics --query 'Topics[?contains(TopicArn, `green-matchers-alerts`)].TopicArn' --output text)

# Attach to all alarms
aws cloudwatch put-metric-alarm \
  --alarm-name green-matchers-api-error-rate-high \
  --alarm-actions $TOPIC_ARN

aws cloudwatch put-metric-alarm \
  --alarm-name green-matchers-cpu-high \
  --alarm-actions $TOPIC_ARN

aws cloudwatch put-metric-alarm \
  --alarm-name green-matchers-memory-high \
  --alarm-actions $TOPIC_ARN

aws cloudwatch put-metric-alarm \
  --alarm-name green-matchers-db-connections-high \
  --alarm-actions $TOPIC_ARN

aws cloudwatch put-metric-alarm \
  --alarm-name green-matchers-api-response-time-high \
  --alarm-actions $TOPIC_ARN
```

---

## 🔧 Datadog Setup

### 1. Install Datadog Agent

```bash
# On Ubuntu/Debian
DD_API_KEY=your-datadog-api-key DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"

# On Amazon Linux 2
DD_API_KEY=your-datadog-api-key DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script_amazon2.sh)"
```

### 2. Configure Datadog Agent

Edit `/etc/datadog-agent/datadog.yaml`:

```yaml
api_key: your-datadog-api-key
site: datadoghq.com

# Enable logs collection
logs_enabled: true

# Enable process collection
process_config:
  enabled: true

# Enable APM tracing
apm_config:
  enabled: true
  env: production
```

### 3. Configure Python APM

Install Datadog tracer:

```bash
pip install ddtrace
```

Update [`apps/backend/main.py`](apps/backend/main.py):

```python
from ddtrace import patch_all

# Patch all supported libraries
patch_all()

# Rest of your code...
```

### 4. Configure Nginx Monitoring

Edit `/etc/datadog-agent/conf.d/nginx.d/conf.yaml`:

```yaml
init_config:

instances:
  - nginx_status_url: http://localhost/nginx_status
    tags:
      - env:production
      - service:green-matchers
```

### 5. Configure Database Monitoring

Edit `/etc/datadog-agent/conf.d/mysql.d/conf.yaml`:

```yaml
init_config:

instances:
  - server: localhost
    port: 3306
    user: datadog
    pass: your-datadog-password
    tags:
      - env:production
      - service:green-matchers
```

### 6. Create Datadog Monitors

#### Monitor 1: API Error Rate

```json
{
  "name": "Green Matchers - API Error Rate High",
  "type": "query alert",
  "query": "avg(last_5m):sum:nginx.request.count{status:error} by {service} / sum:nginx.request.count by {service} > 0.05",
  "message": "API error rate is above 5% for Green Matchers",
  "tags": ["service:green-matchers", "env:production"],
  "options": {
    "thresholds": {
      "critical": 0.05,
      "warning": 0.03
    },
    "notify_no_data": false,
    "renotify_interval": 60
  }
}
```

#### Monitor 2: API Response Time

```json
{
  "name": "Green Matchers - API Response Time High",
  "type": "query alert",
  "query": "avg(last_5m):avg:nginx.request.duration{service:green-matchers} > 1.0",
  "message": "API response time is above 1 second for Green Matchers",
  "tags": ["service:green-matchers", "env:production"],
  "options": {
    "thresholds": {
      "critical": 1.0,
      "warning": 0.5
    },
    "notify_no_data": false,
    "renotify_interval": 60
  }
}
```

#### Monitor 3: CPU Usage

```json
{
  "name": "Green Matchers - CPU Usage High",
  "type": "query alert",
  "query": "avg(last_5m):avg:system.cpu.usage{host:your-host-name} > 80",
  "message": "CPU usage is above 80% for Green Matchers",
  "tags": ["service:green-matchers", "env:production"],
  "options": {
    "thresholds": {
      "critical": 80,
      "warning": 70
    },
    "notify_no_data": false,
    "renotify_interval": 60
  }
}
```

#### Monitor 4: Memory Usage

```json
{
  "name": "Green Matchers - Memory Usage High",
  "type": "query alert",
  "query": "avg(last_5m):avg:system.mem.used_pct{host:your-host-name} > 85",
  "message": "Memory usage is above 85% for Green Matchers",
  "tags": ["service:green-matchers", "env:production"],
  "options": {
    "thresholds": {
      "critical": 85,
      "warning": 75
    },
    "notify_no_data": false,
    "renotify_interval": 60
  }
}
```

#### Monitor 5: Database Connections

```json
{
  "name": "Green Matchers - Database Connections High",
  "type": "query alert",
  "query": "avg(last_5m):avg:mysql.net.connections{host:your-db-host} > 80",
  "message": "Database connections are above 80% for Green Matchers",
  "tags": ["service:green-matchers", "env:production"],
  "options": {
    "thresholds": {
      "critical": 80,
      "warning": 70
    },
    "notify_no_data": false,
    "renotify_interval": 60
  }
}
```

### 7. Create Datadog Dashboard

Use Datadog UI to create a dashboard with:
- API request rate
- API error rate
- API response time (p50, p95, p99)
- CPU usage
- Memory usage
- Database connections
- Database query performance
- Application logs

---

## 🔧 Prometheus + Grafana Setup

### 1. Install Prometheus

```bash
# Add Prometheus repository
sudo apt-get update
sudo apt-get install -y prometheus

# Start Prometheus
sudo systemctl start prometheus
sudo systemctl enable prometheus
```

### 2. Configure Prometheus

Edit `/etc/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'green-matchers-api'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'

  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'mysql'
    static_configs:
      - targets: ['localhost:9104']
```

### 3. Install Node Exporter

```bash
# Add Node Exporter repository
sudo apt-get install -y prometheus-node-exporter

# Start Node Exporter
sudo systemctl start prometheus-node-exporter
sudo systemctl enable prometheus-node-exporter
```

### 4. Install MySQL Exporter

```bash
# Download MySQL Exporter
wget https://github.com/prometheus/mysqld_exporter/releases/download/v0.15.0/mysqld_exporter-0.15.0.linux-amd64.tar.gz
tar xvfz mysqld_exporter-0.15.0.linux-amd64.tar.gz
sudo mv mysqld_exporter-0.15.0.linux-amd64/mysqld_exporter /usr/local/bin/

# Create MySQL exporter user
mysql -u root -p
CREATE USER 'exporter'@'localhost' IDENTIFIED BY 'exporter_password';
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Create MySQL exporter config
sudo cat > /etc/.mysqld_exporter.cnf << EOF
[client]
user=exporter
password=exporter_password
EOF

# Create systemd service
sudo cat > /etc/systemd/system/mysqld_exporter.service << EOF
[Unit]
Description=MySQL Exporter
After=network.target

[Service]
Type=simple
User=prometheus
Environment="DATA_SOURCE_NAME=exporter:exporter_password@(localhost:3306)/"
ExecStart=/usr/local/bin/mysqld_exporter \
  --config.my-cnf=/etc/.mysqld_exporter.cnf \
  --collect.info_schema.processlist \
  --collect.info_schema.innodb_metrics \
  --collect.info_schema.tablestats

[Install]
WantedBy=multi-user.target
EOF

# Start MySQL Exporter
sudo systemctl daemon-reload
sudo systemctl start mysqld_exporter
sudo systemctl enable mysqld_exporter
```

### 5. Install Grafana

```bash
# Add Grafana repository
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
sudo apt-get update
sudo apt-get install -y grafana

# Start Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

### 6. Configure Grafana

1. Access Grafana at `http://your-server:3000`
2. Login with default credentials (admin/admin)
3. Add Prometheus data source:
   - URL: `http://localhost:9090`
   - Access: Server (default)

### 7. Create Grafana Dashboard

Import dashboard with JSON:

```json
{
  "dashboard": {
    "title": "Green Matchers Dashboard",
    "panels": [
      {
        "title": "API Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{path}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "API Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx Errors"
          }
        ],
        "type": "graph"
      },
      {
        "title": "API Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "p95"
          },
          {
            "expr": "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "p99"
          }
        ],
        "type": "graph"
      },
      {
        "title": "CPU Usage",
        "targets": [
          {
            "expr": "100 - (avg by (instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{instance}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Memory Usage",
        "targets": [
          {
            "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
            "legendFormat": "{{instance}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Database Connections",
        "targets": [
          {
            "expr": "mysql_global_status_threads_connected",
            "legendFormat": "Connections"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
```

### 8. Create Prometheus Alert Rules

Edit `/etc/prometheus/alerts.yml`:

```yaml
groups:
  - name: green_matchers_alerts
    interval: 30s
    rules:
      - alert: APIErrorRateHigh
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "API error rate is above 5%"
          description: "API error rate is {{ $value | humanizePercentage }} for Green Matchers"

      - alert: APIResponseTimeHigh
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1.0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API response time is above 1 second"
          description: "API p95 response time is {{ $value }}s for Green Matchers"

      - alert: CPUUsageHigh
        expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU usage is above 80%"
          description: "CPU usage is {{ $value }}% for {{ $labels.instance }}"

      - alert: MemoryUsageHigh
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Memory usage is above 85%"
          description: "Memory usage is {{ $value }}% for {{ $labels.instance }}"

      - alert: DatabaseConnectionsHigh
        expr: mysql_global_status_threads_connected / mysql_global_variables_max_connections > 0.8
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database connections are above 80%"
          description: "Database connections are {{ $value | humanizePercentage }} for Green Matchers"
```

Update Prometheus config to include alert rules:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "/etc/prometheus/alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']

scrape_configs:
  # ... existing scrape_configs ...
```

### 9. Install Alertmanager

```bash
# Download Alertmanager
wget https://github.com/prometheus/alertmanager/releases/download/v0.26.0/alertmanager-0.26.0.linux-amd64.tar.gz
tar xvfz alertmanager-0.26.0.linux-amd64.tar.gz
sudo mv alertmanager-0.26.0.linux-amd64/alertmanager /usr/local/bin/
sudo mv alertmanager-0.26.0.linux-amd64/amtool /usr/local/bin/

# Create systemd service
sudo cat > /etc/systemd/system/alertmanager.service << EOF
[Unit]
Description=Alertmanager
After=network.target

[Service]
Type=simple
User=prometheus
ExecStart=/usr/local/bin/alertmanager \
  --config.file=/etc/alertmanager/alertmanager.yml \
  --storage.path=/var/lib/alertmanager

[Install]
WantedBy=multi-user.target
EOF

# Create config directory
sudo mkdir -p /etc/alertmanager
sudo mkdir -p /var/lib/alertmanager

# Create Alertmanager config
sudo cat > /etc/alertmanager/alertmanager.yml << EOF
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'

  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'default'
    email_configs:
      - to: 'your-email@example.com'
        from: 'alertmanager@greenmatchers.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'your-email@gmail.com'
        auth_password: 'your-app-password'

  - name: 'critical-alerts'
    email_configs:
      - to: 'your-email@example.com'
        from: 'alertmanager@greenmatchers.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'your-email@gmail.com'
        auth_password: 'your-app-password'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts'

  - name: 'warning-alerts'
    email_configs:
      - to: 'your-email@example.com'
        from: 'alertmanager@greenmatchers.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'your-email@gmail.com'
        auth_password: 'your-app-password'
EOF

# Start Alertmanager
sudo systemctl daemon-reload
sudo systemctl start alertmanager
sudo systemctl enable alertmanager
```

---

## 📊 Application Metrics

### Add Prometheus Metrics to Backend

Install dependencies:

```bash
pip install prometheus-fastapi-instrumentator
```

Update [`apps/backend/main.py`](apps/backend/main.py):

```python
from prometheus_fastapi_instrumentator import Instrumentator

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# Rest of your code...
```

### Add Custom Metrics

Create [`apps/backend/core/metrics.py`](apps/backend/core/metrics.py):

```python
"""
Green Matchers - Custom Metrics
"""
from prometheus_client import Counter, Histogram, Gauge

# Request metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

# Database metrics
db_query_duration_seconds = Histogram(
    'db_query_duration_seconds',
    'Database query duration',
    ['query_type']
)

db_connections_active = Gauge(
    'db_connections_active',
    'Active database connections'
)

# Business metrics
job_postings_total = Gauge(
    'job_postings_total',
    'Total job postings'
)

users_total = Gauge(
    'users_total',
    'Total users'
)

applications_total = Gauge(
    'applications_total',
    'Total applications'
)

career_recommendations_total = Counter(
    'career_recommendations_total',
    'Total career recommendations'
)

job_recommendations_total = Counter(
    'job_recommendations_total',
    'Total job recommendations'
)
```

---

## 🚨 Alerting Best Practices

### 1. Alert Severity Levels

- **Critical:** Immediate action required (service down, data loss)
- **Warning:** Action required soon (performance degradation, high resource usage)
- **Info:** Informational (scheduled maintenance, deployments)

### 2. Alert Frequency

- **Critical:** Alert immediately, re-notify every 5 minutes
- **Warning:** Alert after 5 minutes, re-notify every 30 minutes
- **Info:** Alert once, no re-notification

### 3. Alert Channels

- **Email:** For all alerts
- **Slack:** For critical and warning alerts
- **SMS:** For critical alerts only
- **PagerDuty:** For critical alerts only (if available)

### 4. Alert Escalation

- **Level 1:** Send to on-call engineer
- **Level 2:** If not acknowledged in 15 minutes, escalate to team lead
- **Level 3:** If not acknowledged in 30 minutes, escalate to engineering manager

---

## 📈 Monitoring Checklist

- [ ] Monitoring stack installed and configured
- [ ] Log collection enabled
- [ ] Metrics collection enabled
- [ ] Dashboards created
- [ ] Alerts configured
- [ ] Alert notifications configured
- [ ] On-call rotation defined
- [ ] Runbook created for common issues
- [ ] Monitoring tested with simulated failures
- [ ] Documentation updated

---

## 📚 Additional Resources

- [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [Datadog Documentation](https://docs.datadoghq.com/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)

---

## ✅ Summary

This guide provides complete monitoring and alerting setup for Green Matchers production deployment. Choose the monitoring stack that best fits your needs and budget:

- **AWS CloudWatch:** Best for AWS deployments
- **Datadog:** Best for all-in-one solution
- **Prometheus + Grafana:** Best for open-source, cost-effective solution

All monitoring stacks provide:
- ✅ Metrics collection
- ✅ Log aggregation
- ✅ Dashboards
- ✅ Alerting
- ✅ Notification channels

**Monitoring is now ready for production deployment!** 🚀
