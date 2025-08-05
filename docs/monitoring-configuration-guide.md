# GigMatch Monitoring Configuration Guide

## **Overview**
This guide explains how to configure Prometheus and Grafana to work together and monitor your GigMatch application metrics.

---

## **Step 1: Backend Metrics Setup**

### **1.1 Install Prometheus Client**
```bash
cd backend
npm install prom-client
```

### **1.2 Metrics Configuration**
The `backend/metrics.js` file has been created with:
- **HTTP Request Metrics**: Duration and count
- **Application Metrics**: Active users, events, applications
- **Database Metrics**: Connection count
- **System Metrics**: CPU, memory (auto-collected)

### **1.3 Update Server.js**
The server.js has been updated to:
- Include metrics middleware
- Expose `/metrics` endpoint
- Collect HTTP request data automatically

### **1.4 Update Backend Deployment**
The backend deployment now includes Prometheus annotations:
```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "5000"
  prometheus.io/path: "/metrics"
```

---

## **Step 2: Prometheus Configuration**

### **2.1 Current Scrape Configuration**
Prometheus is configured to scrape:
- **GigMatch Backend**: `/metrics` endpoint
- **GigMatch Frontend**: `/metrics` endpoint (when added)
- **MongoDB Exporter**: Database metrics
- **Node Exporter**: System metrics
- **Kubernetes**: Cluster metrics

### **2.2 Verify Scraping**
In Prometheus UI (http://localhost:9090):
1. Go to **Status → Targets**
2. Check if `gigmatch-backend` target is **UP**
3. Verify metrics are being collected

### **2.3 Test Metrics Endpoint**
```bash
# Test the metrics endpoint
curl http://localhost:5000/metrics
```

---

## **Step 3: Grafana Configuration**

### **3.1 Data Source Setup**
1. **Login to Grafana**: http://localhost:3001 (admin/admin123)
2. **Go to**: Configuration → Data Sources
3. **Add Data Source**: Prometheus
4. **URL**: `http://gigmatch-monitoring-prometheus:9090`
5. **Access**: Server (default)
6. **Save & Test**

### **3.2 Pre-configured Dashboards**
Two dashboards are automatically provisioned:

#### **GigMatch Application Overview**
- HTTP Request Rate
- HTTP Request Duration
- Active Users
- Events Created
- Applications Submitted
- Database Connections
- Error Rate

#### **GigMatch Infrastructure**
- CPU Usage
- Memory Usage
- Pod Status
- MongoDB Metrics

---

## **Step 4: Key Metrics to Monitor**

### **4.1 Application Metrics**
```promql
# Request rate
rate(http_requests_total[5m])

# Request duration
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Error rate
rate(http_requests_total{status_code=~"5.."}[5m])

# Active users
active_users_total

# Events created
events_created_total

# Applications submitted
applications_submitted_total
```

### **4.2 Infrastructure Metrics**
```promql
# CPU usage
rate(process_cpu_seconds_total[5m]) * 100

# Memory usage
process_resident_memory_bytes / 1024 / 1024

# Database connections
database_connections_active

# Pod status
kube_pod_status_phase
```

### **4.3 Business Metrics**
```promql
# User engagement
rate(active_users_total[1h])

# Event creation rate
rate(events_created_total[1h])

# Application success rate
rate(applications_submitted_total[1h])
```

---

## **Step 5: Custom Metrics Implementation**

### **5.1 Update Application Code**
To track custom metrics, update your route handlers:

```javascript
// In your route files (e.g., events.js)
const { metrics } = require('../metrics');

// Track event creation
app.post('/api/events', async (req, res) => {
  try {
    // ... create event logic
    metrics.eventsCreated.inc();
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track application submission
app.post('/api/applications', async (req, res) => {
  try {
    // ... submit application logic
    metrics.applicationsSubmitted.inc();
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track active users (example)
app.get('/api/users/active', async (req, res) => {
  try {
    const activeCount = await User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 30*60*1000) } });
    metrics.activeUsers.set(activeCount);
    res.json({ activeUsers: activeCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### **5.2 Database Connection Monitoring**
```javascript
// In your database connection file
const { metrics } = require('./metrics');

mongoose.connection.on('connected', () => {
  metrics.databaseConnections.set(mongoose.connection.readyState);
});

mongoose.connection.on('disconnected', () => {
  metrics.databaseConnections.set(mongoose.connection.readyState);
});
```

---

## **Step 6: Alerting Setup**

### **6.1 Create Alert Rules**
In Prometheus, create alert rules for:

```yaml
# High error rate
- alert: HighErrorRate
  expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "High error rate detected"
    description: "Error rate is {{ $value }} errors per second"

# High response time
- alert: HighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "High response time detected"
    description: "95th percentile response time is {{ $value }} seconds"

# Database connection issues
- alert: DatabaseConnectionIssues
  expr: database_connections_active < 1
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Database connection issues"
    description: "No active database connections"
```

### **6.2 Grafana Alerts**
In Grafana dashboards:
1. **Edit Panel** → **Alert** tab
2. **Create Alert Rule**
3. **Set Conditions** (e.g., response time > 2s)
4. **Configure Notifications**

---

## **Step 7: Dashboard Customization**

### **7.1 Create Custom Dashboards**
1. **New Dashboard** in Grafana
2. **Add Panels** with PromQL queries
3. **Save Dashboard**

### **7.2 Useful Panel Types**
- **Graph**: Time series data
- **Stat**: Single values
- **Table**: Detailed data
- **Heatmap**: Distribution data

### **7.3 Dashboard Variables**
Create variables for filtering:
- **Namespace**: `gigmatch`
- **Pod**: `gigmatch-backend-.*`
- **Service**: `gigmatch-backend`

---

## **Step 8: Performance Optimization**

### **8.1 Scrape Intervals**
Adjust based on your needs:
- **Application metrics**: 30s (current)
- **Infrastructure metrics**: 15s
- **Business metrics**: 1m

### **8.2 Retention Policy**
Configure data retention:
- **Raw data**: 15 days
- **Aggregated data**: 30 days

### **8.3 Resource Limits**
Monitor resource usage:
- **Prometheus**: 512Mi memory, 500m CPU
- **Grafana**: 512Mi memory, 500m CPU

---

## **Step 9: Troubleshooting**

### **9.1 Metrics Not Appearing**
```bash
# Check if metrics endpoint is accessible
kubectl port-forward -n gigmatch svc/gigmatch-backend 5000:5000
curl http://localhost:5000/metrics

# Check Prometheus targets
# Go to http://localhost:9090/targets
```

### **9.2 Grafana No Data**
1. **Check Data Source**: Configuration → Data Sources
2. **Test Connection**: Verify Prometheus URL
3. **Check Queries**: Use Prometheus UI to test PromQL

### **9.3 High Resource Usage**
```bash
# Check resource usage
kubectl top pods -n monitoring

# Check logs
kubectl logs -n monitoring -l app.kubernetes.io/component=prometheus
kubectl logs -n monitoring -l app.kubernetes.io/component=grafana
```

---

## **Step 10: Best Practices**

### **10.1 Metric Naming**
- Use descriptive names: `http_requests_total`
- Include units: `response_time_seconds`
- Use consistent naming conventions

### **10.2 Labeling**
- Add relevant labels: `method`, `route`, `status_code`
- Don't over-label (cardinality explosion)
- Use consistent label names

### **10.3 Dashboard Design**
- Group related metrics
- Use appropriate visualization types
- Include context and thresholds
- Keep dashboards focused and readable

### **10.4 Alerting**
- Set realistic thresholds
- Use different severity levels
- Include actionable descriptions
- Test alerts regularly

---

## **Summary**

Your monitoring stack is now configured to:
- ✅ **Collect Application Metrics**: HTTP requests, business metrics
- ✅ **Monitor Infrastructure**: CPU, memory, database
- ✅ **Visualize Data**: Pre-configured Grafana dashboards
- ✅ **Track Performance**: Response times, error rates
- ✅ **Scale Monitoring**: Easy to add new metrics

The system provides comprehensive visibility into your GigMatch application's performance and health, enabling proactive monitoring and troubleshooting. 