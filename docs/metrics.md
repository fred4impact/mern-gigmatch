# GigMatch Cluster Metrics Documentation

## **Overview**
This document provides a comprehensive overview of all metrics being monitored in the GigMatch Kubernetes cluster, including infrastructure, application, and business metrics.

---

## **Current Monitoring Stack**

### **Monitoring Components**
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Node Exporter**: System-level metrics
- **MongoDB Exporter**: Database metrics
- **Kubernetes Service Discovery**: Automatic target discovery

### **Monitoring Namespaces**
- **monitoring**: Prometheus, Grafana, exporters
- **gigmatch**: Application services
- **kube-system**: Kubernetes system components

---

## **Infrastructure Monitoring**

### **1. Kubernetes Cluster Metrics**

#### **1.1 Kubernetes API Server**
```promql
# API request rate
rate(apiserver_request_total[5m])

# API request duration
histogram_quantile(0.95, rate(apiserver_request_duration_seconds_bucket[5m]))

# API errors
rate(apiserver_request_total{code=~"5.."}[5m])
```

**What's Monitored:**
- API server performance
- Request rates and latencies
- Error rates
- Authentication/authorization metrics

#### **1.2 Kubernetes Nodes**
```promql
# Node status
kube_node_status_condition

# Node resources
kube_node_status_capacity
kube_node_status_allocatable

# Node labels
kube_node_labels
```

**What's Monitored:**
- Node health and status
- Resource capacity and allocation
- Node labels and annotations

#### **1.3 Pod Metrics**
```promql
# Pod status


# Pod resource usage
kube_pod_container_resource_requests
kube_pod_container_resource_limits

# Pod restarts
kube_pod_container_status_restarts_total
```

**What's Monitored:**
- Pod lifecycle and status
- Resource requests and limits
- Container restart counts
- Pod labels and annotations

#### **1.4 Service Metrics**
```promql
# Service endpoints
kube_endpoint_address_available
kube_endpoint_address_not_ready

# Service ports
kube_service_spec_ports
```

**What's Monitored:**
- Service endpoint availability
- Service port configurations
- Service discovery status

### **2. System-Level Metrics (Node Exporter)**

#### **2.1 CPU Metrics**
```promql
# CPU usage percentage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# CPU load averages
node_load1
node_load5
node_load15

# CPU frequency
node_cpu_frequency_hertz
```

**What's Monitored:**
- CPU utilization per core
- System load averages
- CPU frequency and temperature
- CPU context switches

#### **2.2 Memory Metrics**
```promql
# Memory usage percentage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Memory breakdown
node_memory_MemTotal_bytes
node_memory_MemAvailable_bytes
node_memory_MemFree_bytes
node_memory_Cached_bytes
node_memory_Buffers_bytes
```

**What's Monitored:**
- Total and available memory
- Memory usage breakdown
- Swap usage
- Memory pressure indicators

#### **2.3 Disk Metrics**
```promql
# Disk usage percentage
(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100

# Disk I/O
rate(node_disk_io_time_seconds_total[5m])
rate(node_disk_read_bytes_total[5m])
rate(node_disk_written_bytes_total[5m])
```

**What's Monitored:**
- Disk space usage
- Disk I/O operations
- Disk latency
- File system metrics

#### **2.4 Network Metrics**
```promql
# Network traffic
rate(node_network_receive_bytes_total[5m])
rate(node_network_transmit_bytes_total[5m])

# Network errors
rate(node_network_receive_errs_total[5m])
rate(node_network_transmit_errs_total[5m])
```

**What's Monitored:**
- Network traffic (bytes in/out)
- Network errors and drops
- Network interface status
- Network latency

---

## **Application Monitoring**

### **3. GigMatch Backend Metrics**

#### **3.1 HTTP Request Metrics**
```promql
# Request rate
rate(http_requests_total[5m])

# Request duration
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status_code=~"4..|5.."}[5m])

# Success rate
rate(http_requests_total{status_code=~"2.."}[5m]) / rate(http_requests_total[5m]) * 100
```

**What's Monitored:**
- HTTP request volume
- Response times (percentiles)
- Error rates (4xx, 5xx)
- Success rates
- Request methods and endpoints

#### **3.2 Application-Specific Metrics**
```promql
# Active users
active_users_total

# Events created
events_created_total

# Applications submitted
applications_submitted_total

# Database connections
database_connections_active
```

**What's Monitored:**
- Business logic metrics
- User activity
- Database connection pool
- Custom application events

#### **3.3 Process Metrics**
```promql
# CPU usage
rate(process_cpu_seconds_total[5m]) * 100

# Memory usage
process_resident_memory_bytes / 1024 / 1024

# Process uptime
process_start_time_seconds
```

**What's Monitored:**
- Application CPU usage
- Application memory usage
- Process uptime
- Node.js specific metrics

### **4. GigMatch Frontend Metrics**

#### **4.1 Frontend Performance**
```promql
# Page load times (if available)
frontend_page_load_duration_seconds

# User interactions (if available)
frontend_user_interactions_total

# Error tracking (if available)
frontend_errors_total
```

**What's Monitored:**
- Frontend performance metrics
- User interaction tracking
- Client-side errors
- Page view analytics

---

## **Database Monitoring**

### **5. MongoDB Metrics**

#### **5.1 Connection Metrics**
```promql
# Active connections
mongodb_connections

# Connection pool
mongodb_connections_current
mongodb_connections_available
mongodb_connections_pending
```

**What's Monitored:**
- Active database connections
- Connection pool status
- Connection limits
- Connection errors

#### **5.2 Performance Metrics**
```promql
# Operation rates
rate(mongodb_mongod_op_latencies_latency_total[5m])

# Query performance
rate(mongodb_mongod_op_latencies_latency_total[5m])

# Index usage
mongodb_mongod_db_collection_index_count
```

**What's Monitored:**
- Database operation rates
- Query latencies
- Index usage and performance
- Collection statistics

#### **5.3 Storage Metrics**
```promql
# Database size
mongodb_mongod_db_collection_size_bytes

# Storage engine
mongodb_mongod_storage_engine
mongodb_mongod_op_latencies_latency_total
```

**What's Monitored:**
- Database storage usage
- Collection sizes
- Storage engine metrics
- Data file statistics

---

## **Monitoring Stack Self-Monitoring**

### **6. Prometheus Self-Monitoring**

#### **6.1 Prometheus Performance**
```promql
# Scrape duration
prometheus_target_scrape_pool_targets

# Storage metrics
prometheus_tsdb_head_samples_appended_total

# Rule evaluation
prometheus_rule_evaluation_duration_seconds
```

**What's Monitored:**
- Scrape job performance
- Storage metrics
- Rule evaluation times
- Prometheus server health

#### **6.2 Target Health**
```promql
# Target status
up

# Scrape duration
scrape_duration_seconds

# Scrape errors
scrape_samples_post_metric_relabeling
```

**What's Monitored:**
- Target availability
- Scrape performance
- Metric collection success
- Relabeling results

### **7. Grafana Monitoring**

#### **7.1 Grafana Performance**
```promql
# Dashboard rendering
grafana_dashboard_rendering_duration_seconds

# User activity
grafana_user_login_total

# API usage
grafana_api_requests_total
```

**What's Monitored:**
- Dashboard performance
- User activity
- API usage
- Grafana server health

---

## **Missing Metrics (Not Currently Monitored)**

### **8. Infrastructure Gaps**

#### **8.1 Ingress Controller**
```promql
# Nginx Ingress metrics (not configured)
nginx_ingress_controller_nginx_process_connections
nginx_ingress_controller_nginx_process_requests
nginx_ingress_controller_nginx_process_resident_memory_bytes
```

**What's Missing:**
- Ingress request rates
- Ingress error rates
- SSL certificate metrics
- Upstream response times

#### **8.2 Load Balancer**
```promql
# Load balancer metrics (not configured)
load_balancer_requests_total
load_balancer_response_time_seconds
load_balancer_backend_health
```

**What's Missing:**
- External load balancer metrics
- Backend health checks
- Traffic distribution
- SSL termination metrics

#### **8.3 Storage**
```promql
# Persistent volume metrics (not configured)
kubelet_volume_stats_used_bytes
kubelet_volume_stats_capacity_bytes
kubelet_volume_stats_available_bytes
```

**What's Missing:**
- Persistent volume usage
- Storage class metrics
- Volume performance
- Storage capacity planning

### **9. Application Gaps**

#### **9.1 Business Metrics**
```promql
# Business KPIs (not implemented)
business_revenue_total
business_conversion_rate
business_user_retention_rate
business_feature_usage_total
```

**What's Missing:**
- Revenue metrics
- User conversion rates
- Feature adoption
- Business KPIs

#### **9.2 Security Metrics**
```promql
# Security metrics (not implemented)
security_login_attempts_total
security_failed_logins_total
security_api_rate_limit_hits_total
```

**What's Missing:**
- Authentication metrics
- Authorization failures
- Rate limiting events
- Security incidents

---

## **Metrics Collection Configuration**

### **10. Scrape Configuration**

#### **10.1 Current Scrape Jobs**
```yaml
# Prometheus scrape configuration
scrape_configs:
  - job_name: 'prometheus'          # Self-monitoring
  - job_name: 'node-exporter'       # System metrics
  - job_name: 'mongodb-exporter'    # Database metrics
  - job_name: 'gigmatch-backend'    # Backend application
  - job_name: 'gigmatch-frontend'   # Frontend application
  - job_name: 'kubernetes-apiservers' # K8s API
  - job_name: 'kubernetes-nodes'    # K8s nodes
```

#### **10.2 Scrape Intervals**
- **Infrastructure metrics**: 15s
- **Application metrics**: 30s
- **Business metrics**: 1m (when implemented)

#### **10.3 Retention Policy**
- **Raw data**: 15 days
- **Aggregated data**: 30 days
- **Alert history**: 7 days

---

## **Alerting Rules**

### **11. Infrastructure Alerts**

#### **11.1 Node Alerts**
```yaml
- alert: HighNodeCPU
  expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
  for: 5m
  labels:
    severity: warning

- alert: HighNodeMemory
  expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
  for: 5m
  labels:
    severity: warning
```

#### **11.2 Pod Alerts**
```yaml
- alert: PodCrashLooping
  expr: rate(kube_pod_container_status_restarts_total[15m]) * 60 > 0
  for: 5m
  labels:
    severity: critical

- alert: PodNotReady
  expr: kube_pod_status_phase{phase!="Running"} > 0
  for: 5m
  labels:
    severity: warning
```

### **12. Application Alerts**

#### **12.1 Performance Alerts**
```yaml
- alert: HighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
  for: 2m
  labels:
    severity: warning

- alert: HighErrorRate
  expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
  for: 2m
  labels:
    severity: critical
```

#### **12.2 Business Alerts**
```yaml
- alert: LowSuccessRate
  expr: (rate(http_requests_total{status_code=~"2.."}[5m]) / rate(http_requests_total[5m])) * 100 < 95
  for: 2m
  labels:
    severity: warning
```

---

## **Dashboard Configuration**

### **13. Pre-configured Dashboards**

#### **13.1 Application Overview Dashboard**
- HTTP Request Rate
- HTTP Request Duration
- Error Rate
- Success Rate
- Active Users
- Events Created
- Applications Submitted

#### **13.2 Infrastructure Dashboard**
- CPU Usage
- Memory Usage
- Disk Usage
- Network Traffic
- Pod Status
- MongoDB Connections

#### **13.3 Business Metrics Dashboard**
- User Engagement
- Event Creation Rate
- Application Success Rate
- Database Performance
- System Health

---

## **Metrics Best Practices**

### **14. Naming Conventions**
- Use descriptive names: `http_requests_total`
- Include units: `response_time_seconds`
- Use consistent naming: `gigmatch_*` prefix for app metrics

### **15. Labeling Strategy**
- **Required labels**: `namespace`, `pod`, `service`
- **Optional labels**: `method`, `route`, `status_code`
- **Avoid cardinality explosion**: Limit label values

### **16. Query Optimization**
- Use efficient PromQL queries
- Set appropriate time ranges
- Use recording rules for complex queries
- Monitor query performance

---

## **Summary**

### **✅ Currently Monitored**
- **Infrastructure**: Kubernetes cluster, nodes, pods, services
- **System**: CPU, memory, disk, network
- **Application**: HTTP metrics, process metrics
- **Database**: MongoDB connections, performance
- **Monitoring Stack**: Prometheus, Grafana self-monitoring

### **❌ Not Yet Monitored**
- **Ingress Controller**: Nginx metrics
- **Load Balancer**: External LB metrics
- **Storage**: Persistent volume metrics
- **Business KPIs**: Revenue, conversion, retention
- **Security**: Authentication, authorization metrics

### **🚀 Next Steps**
1. Add application metrics endpoints
2. Configure ingress monitoring
3. Implement business metrics
4. Set up security monitoring
5. Create custom dashboards

This monitoring setup provides comprehensive visibility into your GigMatch cluster's infrastructure and application health, enabling proactive monitoring and troubleshooting. 