# Grafana & Prometheus UI Configuration Guide

## **Overview**
This guide shows how to configure monitoring for your GigMatch application using only the Grafana and Prometheus web interfaces, without any code changes.

---

## **Prerequisites**
- ✅ Prometheus running at http://localhost:9090
- ✅ Grafana running at http://localhost:3001
- ✅ GigMatch application deployed and running

---

## **Step 1: Configure Prometheus Data Source in Grafana**

### **1.1 Access Grafana**
1. Open browser: http://localhost:3001
2. **Login**: admin/admin123

### **1.2 Add Prometheus Data Source**
1. **Go to**: Configuration (gear icon) → Data Sources
2. **Click**: "Add data source"
3. **Select**: Prometheus
4. **Configure**:
   - **Name**: Prometheus
   - **URL**: `http://gigmatch-monitoring-prometheus:9090`
   - **Access**: Server (default)
   - **Scrape interval**: 15s
5. **Click**: "Save & Test"
6. **Verify**: "Data source is working" message

---

## **Step 2: Create GigMatch Application Dashboard**

### **2.1 Create New Dashboard**
1. **Go to**: Dashboards → New Dashboard
2. **Click**: "Add new panel"

### **2.2 HTTP Request Rate Panel**
1. **Panel Title**: "HTTP Request Rate"
2. **Query**:
   ```promql
   rate(http_requests_total[5m])
   ```
3. **Legend**: `{{method}} {{route}}`
4. **Visualization**: Time series
5. **Save Panel**

### **2.3 HTTP Request Duration Panel**
1. **Add Panel** → "Add new panel"
2. **Panel Title**: "HTTP Request Duration (95th percentile)"
3. **Query**:
   ```promql
   histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
   ```
4. **Legend**: `{{method}} {{route}}`
5. **Visualization**: Time series
6. **Y-axis**: Unit → seconds
7. **Save Panel**

### **2.4 Error Rate Panel**
1. **Add Panel** → "Add new panel"
2. **Panel Title**: "Error Rate (4xx & 5xx)"
3. **Query A**:
   ```promql
   rate(http_requests_total{status_code=~"5.."}[5m])
   ```
   **Legend**: 5xx Errors
4. **Query B**:
   ```promql
   rate(http_requests_total{status_code=~"4.."}[5m])
   ```
   **Legend**: 4xx Errors
5. **Visualization**: Time series
6. **Save Panel**

### **2.5 Success Rate Panel**
1. **Add Panel** → "Add new panel"
2. **Panel Title**: "Success Rate (%)"
3. **Query**:
   ```promql
   (rate(http_requests_total{status_code=~"2.."}[5m]) / rate(http_requests_total[5m])) * 100
   ```
4. **Legend**: Success Rate
5. **Visualization**: Stat
6. **Unit**: percent (0-100)
7. **Save Panel**

### **2.6 Save Dashboard**
1. **Dashboard Title**: "GigMatch Application Overview"
2. **Tags**: gigmatch, application
3. **Save Dashboard**

---

## **Step 3: Create Infrastructure Dashboard**

### **3.1 Create New Dashboard**
1. **Go to**: Dashboards → New Dashboard
2. **Click**: "Add new panel"

### **3.2 CPU Usage Panel**
1. **Panel Title**: "CPU Usage"
2. **Query**:
   ```promql
   rate(process_cpu_seconds_total[5m]) * 100
   ```
3. **Legend**: `{{pod}}`
4. **Visualization**: Time series
5. **Y-axis**: Unit → percent (0-100)
6. **Save Panel**

### **3.3 Memory Usage Panel**
1. **Add Panel** → "Add new panel"
2. **Panel Title**: "Memory Usage (MB)"
3. **Query**:
   ```promql
   process_resident_memory_bytes / 1024 / 1024
   ```
4. **Legend**: `{{pod}} MB`
5. **Visualization**: Time series
6. **Y-axis**: Unit → bytes (MB)
7. **Save Panel**

### **3.4 Pod Status Panel**
1. **Add Panel** → "Add new panel"
2. **Panel Title**: "Pod Status"
3. **Query**:
   ```promql
   kube_pod_status_phase
   ```
4. **Legend**: `{{pod}} - {{phase}}`
5. **Visualization**: Stat
6. **Save Panel**

### **3.5 MongoDB Connections Panel**
1. **Add Panel** → "Add new panel"
2. **Panel Title**: "MongoDB Connections"
3. **Query**:
   ```promql
   mongodb_connections
   ```
4. **Legend**: `{{pod}}`
5. **Visualization**: Time series
6. **Save Panel**

### **3.6 Save Dashboard**
1. **Dashboard Title**: "GigMatch Infrastructure"
2. **Tags**: gigmatch, infrastructure
3. **Save Dashboard**

---

## **Step 4: Create Business Metrics Dashboard**

### **4.1 Create New Dashboard**
1. **Go to**: Dashboards → New Dashboard
2. **Click**: "Add new panel"

### **4.2 Active Users Panel**
1. **Panel Title**: "Active Users"
2. **Query**:
   ```promql
   active_users_total
   ```
3. **Legend**: Active Users
4. **Visualization**: Stat
5. **Save Panel**

### **4.3 Events Created Panel**
1. **Add Panel** → "Add new panel"
2. **Panel Title**: "Events Created"
3. **Query**:
   ```promql
   events_created_total
   ```
4. **Legend**: Events Created
5. **Visualization**: Stat
6. **Save Panel**

### **4.4 Applications Submitted Panel**
1. **Add Panel** → "Add new panel"
2. **Panel Title**: "Applications Submitted"
3. **Query**:
   ```promql
   applications_submitted_total
   ```
4. **Legend**: Applications Submitted
5. **Visualization**: Stat
6. **Save Panel**

### **4.5 Database Connections Panel**
1. **Add Panel** → "Add new panel"
2. **Panel Title**: "Database Connections"
3. **Query**:
   ```promql
   database_connections_active
   ```
4. **Legend**: Active Connections
5. **Visualization**: Stat
6. **Save Panel**

### **4.6 Save Dashboard**
1. **Dashboard Title**: "GigMatch Business Metrics"
2. **Tags**: gigmatch, business
3. **Save Dashboard**

---

## **Step 5: Configure Alerting**

### **5.1 Create Alert Rules in Grafana**

#### **High Error Rate Alert**
1. **Edit Panel**: Error Rate panel
2. **Alert Tab**: Click "Alert" tab
3. **Create Alert Rule**:
   - **Name**: "High Error Rate"
   - **Condition**: `rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1`
   - **For**: 2m
   - **Severity**: Critical
4. **Save Alert**

#### **High Response Time Alert**
1. **Edit Panel**: HTTP Request Duration panel
2. **Alert Tab**: Click "Alert" tab
3. **Create Alert Rule**:
   - **Name**: "High Response Time"
   - **Condition**: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2`
   - **For**: 2m
   - **Severity**: Warning
4. **Save Alert**

#### **Low Success Rate Alert**
1. **Edit Panel**: Success Rate panel
2. **Alert Tab**: Click "Alert" tab
3. **Create Alert Rule**:
   - **Name**: "Low Success Rate"
   - **Condition**: `(rate(http_requests_total{status_code=~"2.."}[5m]) / rate(http_requests_total[5m])) * 100 < 95`
   - **For**: 2m
   - **Severity**: Warning
4. **Save Alert**

### **5.2 Configure Notification Channels**
1. **Go to**: Alerting → Notification channels
2. **Add Channel**:
   - **Name**: Email Alerts
   - **Type**: Email
   - **Email**: your-email@example.com
3. **Test** and **Save**

---

## **Step 6: Create Dashboard Variables**

### **6.1 Add Namespace Variable**
1. **Edit Dashboard** → Settings → Variables
2. **Add Variable**:
   - **Name**: namespace
   - **Type**: Query
   - **Query**: `label_values(kube_pod_info, namespace)`
   - **Default**: gigmatch
3. **Save**

### **6.2 Add Pod Variable**
1. **Add Variable**:
   - **Name**: pod
   - **Type**: Query
   - **Query**: `label_values(kube_pod_info{namespace="$namespace"}, pod)`
   - **Multi-value**: true
3. **Save**

### **6.3 Update Queries to Use Variables**
Update your panel queries to use variables:
```promql
# Instead of hardcoded namespace
rate(http_requests_total[5m])

# Use variable
rate(http_requests_total{namespace="$namespace"}[5m])
```

---

## **Step 7: Create Custom Queries**

### **7.1 Request Rate by Endpoint**
```promql
rate(http_requests_total[5m])
```

### **7.2 Average Response Time**
```promql
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

### **7.3 Error Percentage**
```promql
(rate(http_requests_total{status_code=~"4..|5.."}[5m]) / rate(http_requests_total[5m])) * 100
```

### **7.4 Top 5 Slowest Endpoints**
```promql
topk(5, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))
```

### **7.5 Request Volume by Hour**
```promql
increase(http_requests_total[1h])
```

---

## **Step 8: Dashboard Organization**

### **8.1 Create Folders**
1. **Go to**: Dashboards → Manage
2. **New Folder**:
   - **Name**: GigMatch
   - **Description**: GigMatch application dashboards

### **8.2 Organize Dashboards**
Move dashboards to the GigMatch folder:
- GigMatch Application Overview
- GigMatch Infrastructure
- GigMatch Business Metrics

### **8.3 Set Dashboard Permissions**
1. **Edit Dashboard** → Settings → Permissions
2. **Add Permission**:
   - **Role**: Viewer
   - **Permission**: View

---

## **Step 9: Advanced Visualizations**

### **9.1 Heatmap for Response Times**
1. **Add Panel** → "Add new panel"
2. **Panel Title**: "Response Time Distribution"
3. **Query**:
   ```promql
   rate(http_request_duration_seconds_bucket[5m])
   ```
4. **Visualization**: Heatmap
5. **Save Panel**

### **9.2 Table for Top Endpoints**
1. **Add Panel** → "Add new panel"
2. **Panel Title**: "Top Endpoints by Request Volume"
3. **Query**:
   ```promql
   topk(10, rate(http_requests_total[5m]))
   ```
4. **Visualization**: Table
5. **Save Panel**

### **9.3 Gauge for Success Rate**
1. **Add Panel** → "Add new panel"
2. **Panel Title**: "Overall Success Rate"
3. **Query**:
   ```promql
   (rate(http_requests_total{status_code=~"2.."}[5m]) / rate(http_requests_total[5m])) * 100
   ```
4. **Visualization**: Gauge
5. **Min**: 0, **Max**: 100
6. **Save Panel**

---

## **Step 10: Dashboard Sharing**

### **10.1 Export Dashboard**
1. **Edit Dashboard** → Settings → JSON Model
2. **Copy JSON** or **Download**

### **10.2 Import Dashboard**
1. **Dashboards** → Import
2. **Upload JSON** or **Paste JSON**
3. **Configure** data source mapping
4. **Import**

### **10.3 Share Dashboard Link**
1. **Edit Dashboard** → Settings → Links
2. **Add Link**:
   - **Title**: Share Dashboard
   - **URL**: Current dashboard URL
   - **Tooltip**: Share this dashboard

---

## **Step 11: Prometheus UI Configuration**

### **11.1 Access Prometheus**
1. Open browser: http://localhost:9090
2. **Go to**: Graph tab

### **11.2 Test Queries**
Test these queries in Prometheus UI:

#### **Basic Metrics**
```promql
# All HTTP requests
http_requests_total

# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status_code=~"5.."}[5m])
```

#### **Application Metrics**
```promql
# Active users
active_users_total

# Events created
events_created_total

# Applications submitted
applications_submitted_total
```

#### **Infrastructure Metrics**
```promql
# CPU usage
rate(process_cpu_seconds_total[5m]) * 100

# Memory usage
process_resident_memory_bytes / 1024 / 1024

# Database connections
database_connections_active
```

### **11.3 Check Targets**
1. **Go to**: Status → Targets
2. **Verify** all targets are UP
3. **Check** scrape intervals and last scrape times

### **11.4 View Rules**
1. **Go to**: Status → Rules
2. **Check** if any alerting rules are configured
3. **View** rule evaluation status

---

## **Step 12: Troubleshooting**

### **12.1 No Data in Grafana**
1. **Check Data Source**: Configuration → Data Sources
2. **Test Connection**: Verify Prometheus URL
3. **Check Queries**: Use Prometheus UI to test PromQL
4. **Verify Targets**: Check if metrics are being scraped

### **12.2 Missing Metrics**
1. **Check Prometheus Targets**: Status → Targets
2. **Verify Endpoints**: Test `/metrics` endpoint directly
3. **Check Labels**: Ensure proper labeling in queries
4. **Review Scrape Config**: Verify job configurations

### **12.3 Dashboard Issues**
1. **Refresh Dashboard**: Manual refresh
2. **Check Time Range**: Verify time range settings
3. **Review Variables**: Check variable values
4. **Validate Queries**: Test queries in Prometheus UI

---

## **Step 13: Best Practices**

### **13.1 Dashboard Design**
- **Group Related Metrics**: Keep similar metrics together
- **Use Appropriate Visualizations**: Choose the right chart type
- **Include Context**: Add descriptions and thresholds
- **Keep it Simple**: Don't overcrowd dashboards

### **13.2 Query Optimization**
- **Use Efficient Queries**: Avoid expensive operations
- **Set Appropriate Ranges**: Use reasonable time windows
- **Limit Cardinality**: Don't over-label metrics
- **Cache Results**: Use recording rules for complex queries

### **13.3 Alerting**
- **Set Realistic Thresholds**: Base on historical data
- **Use Different Severities**: Critical, Warning, Info
- **Include Context**: Add actionable descriptions
- **Test Alerts**: Verify alert conditions

---

## **Summary**

This UI-only configuration approach allows you to:
- ✅ **Configure Data Sources**: Connect Prometheus to Grafana
- ✅ **Create Dashboards**: Build comprehensive monitoring views
- ✅ **Set Up Alerting**: Configure proactive notifications
- ✅ **Organize Metrics**: Structure monitoring effectively
- ✅ **Share Dashboards**: Export and import configurations

All without modifying your application code! The monitoring stack will automatically collect available metrics and you can visualize them through the web interfaces. 