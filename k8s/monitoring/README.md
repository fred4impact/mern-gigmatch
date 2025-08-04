# GigMatch Monitoring Stack

This directory contains a comprehensive monitoring solution for the GigMatch MERN application running on Kubernetes.

## 🎯 Monitoring Components

### Core Stack
- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards
- **Node Exporter** - System-level metrics
- **MongoDB Exporter** - Database-specific metrics

### What Gets Monitored
- ✅ **Application Metrics** - Backend and frontend performance
- ✅ **Database Metrics** - MongoDB health and performance
- ✅ **System Metrics** - CPU, memory, disk, network
- ✅ **Kubernetes Metrics** - Pods, services, deployments
- ✅ **Infrastructure Metrics** - Node health and resources

## 🚀 Quick Start

### 1. Deploy Monitoring Stack
```bash
cd k8s/monitoring
chmod +x deploy-monitoring.sh
./deploy-monitoring.sh
```

### 2. Add Host Entries
```bash
# Add to /etc/hosts
127.0.0.1 grafana.gigmatch.local
127.0.0.1 prometheus.gigmatch.local
```

### 3. Access Monitoring Tools
- **Grafana**: http://grafana.gigmatch.local (admin/admin123)
- **Prometheus**: http://prometheus.gigmatch.local

## 📊 Available Metrics

### Application Metrics
- HTTP request rates and response times
- Error rates and status codes
- Application-specific business metrics
- Memory and CPU usage per container

### Database Metrics
- MongoDB connection count
- Query performance
- Database size and growth
- Index usage and performance

### System Metrics
- Node CPU, memory, and disk usage
- Network I/O and bandwidth
- File system usage
- Process and container metrics

### Kubernetes Metrics
- Pod status and health
- Service endpoints
- Deployment replicas and availability
- Resource requests and limits

## 🛠️ Manual Deployment

### Step-by-Step Deployment
```bash
# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Deploy Prometheus
kubectl apply -f prometheus-config.yaml
kubectl apply -f prometheus-deployment.yaml

# 3. Deploy Node Exporter
kubectl apply -f node-exporter.yaml

# 4. Deploy MongoDB Exporter
kubectl apply -f mongodb-exporter.yaml

# 5. Deploy Grafana
kubectl apply -f grafana-deployment.yaml

# 6. Deploy Ingress
kubectl apply -f monitoring-ingress.yaml
```

### Check Deployment Status
```bash
# Check all monitoring pods
kubectl get pods -n monitoring

# Check services
kubectl get services -n monitoring

# Check ingress
kubectl get ingress -n monitoring
```

## 📈 Grafana Dashboards

### Recommended Dashboards to Import

1. **Node Exporter Full** (ID: 1860)
   - System metrics dashboard
   - CPU, memory, disk, network

2. **MongoDB Overview** (ID: 2583)
   - Database performance metrics
   - Connection stats, query performance

3. **Kubernetes Cluster Monitoring** (ID: 315)
   - Cluster-wide metrics
   - Pod and service health

4. **Custom GigMatch Dashboard** (Create your own)
   - Application-specific metrics
   - Business KPIs

### Importing Dashboards
1. Go to Grafana (http://grafana.gigmatch.local)
2. Login with admin/admin123
3. Click "+" → "Import"
4. Enter dashboard ID or upload JSON
5. Select Prometheus as data source

## 🔧 Configuration

### Prometheus Configuration
The Prometheus configuration (`prometheus-config.yaml`) includes:
- Scrape intervals for different targets
- Job configurations for all components
- Kubernetes service discovery
- Custom metrics endpoints

### Grafana Configuration
- Pre-configured Prometheus data source
- Persistent storage for dashboards
- Default admin credentials (change in production)

### MongoDB Exporter
- Connects to GigMatch MongoDB instance
- Exposes database metrics on port 9216
- Monitors connection health and performance

## 📋 Useful kubectl Commands

### Check Monitoring Status
```bash
# Check all monitoring resources
kubectl get all -n monitoring

# Check specific component
kubectl get pods -l app=prometheus -n monitoring
kubectl get pods -l app=grafana -n monitoring

# View logs
kubectl logs -l app=prometheus -n monitoring
kubectl logs -l app=grafana -n monitoring
```

### Access Monitoring Tools
```bash
# Port forward to access locally
kubectl port-forward svc/grafana 3000:3000 -n monitoring
kubectl port-forward svc/prometheus 9090:9090 -n monitoring

# Check metrics endpoints
curl http://localhost:9090/metrics  # Prometheus
curl http://localhost:3000/api/health  # Grafana
```

### Troubleshooting
```bash
# Check if metrics are being collected
kubectl exec -it <prometheus-pod> -n monitoring -- wget -qO- localhost:9090/api/v1/targets

# Check MongoDB exporter connection
kubectl logs -l app=mongodb-exporter -n monitoring

# Check Node Exporter
kubectl get pods -l app=node-exporter -n monitoring
```

## 🔔 Setting Up Alerts (Optional)

### Prometheus Alert Rules
Create `prometheus-alerts.yaml`:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-alerts
  namespace: monitoring
data:
  alerts.yml: |
    groups:
    - name: gigmatch
      rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
```

### Alert Manager (Optional)
For production, consider adding AlertManager for alert routing and notification.

## 🧹 Cleanup

### Remove Monitoring Stack
```bash
# Delete all monitoring resources
kubectl delete namespace monitoring

# Or delete individual components
kubectl delete -f monitoring-ingress.yaml
kubectl delete -f grafana-deployment.yaml
kubectl delete -f mongodb-exporter.yaml
kubectl delete -f node-exporter.yaml
kubectl delete -f prometheus-deployment.yaml
kubectl delete -f prometheus-config.yaml
kubectl delete -f namespace.yaml
```

## 🔒 Security Considerations

### Production Recommendations
1. **Change default passwords** - Update Grafana admin password
2. **Use secrets** - Store sensitive configuration in Kubernetes secrets
3. **Network policies** - Restrict access to monitoring endpoints
4. **RBAC** - Limit monitoring service account permissions
5. **TLS** - Enable HTTPS for monitoring interfaces

### Current Security Settings
- Grafana admin password: `admin123` (change this!)
- Prometheus and Grafana exposed via ingress
- Service accounts with minimal required permissions
- Persistent storage for data retention

## 📚 Additional Resources

### Documentation
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Node Exporter](https://github.com/prometheus/node_exporter)
- [MongoDB Exporter](https://github.com/percona/mongodb_exporter)

### Useful Metrics Queries
```promql
# Application response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Memory usage
container_memory_usage_bytes{container="backend"}

# CPU usage
rate(container_cpu_usage_seconds_total{container="backend"}[5m])
```

## 🎯 Next Steps

1. **Import recommended dashboards** in Grafana
2. **Configure custom metrics** for your application
3. **Set up alerts** for critical thresholds
4. **Create business-specific dashboards**
5. **Monitor application logs** (consider adding ELK stack)
6. **Set up log aggregation** for better debugging 