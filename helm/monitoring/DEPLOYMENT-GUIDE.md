# GigMatch Monitoring Stack - Helm + ArgoCD Deployment Guide

This guide explains how to deploy the monitoring stack for GigMatch using Helm charts and ArgoCD, without modifying your application code.

## 🎯 Overview

The monitoring stack includes:
- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards  
- **Node Exporter** - System-level metrics
- **MongoDB Exporter** - Database-specific metrics

## 🚀 Quick Deployment with ArgoCD

### 1. Update Repository URL
Edit `argocd-apps/monitoring-app.yaml`:
```yaml
source:
  repoURL: https://github.com/YOUR-USERNAME/mern-gigmatch.git
  targetRevision: HEAD
  path: helm/monitoring
```

### 2. Deploy via ArgoCD
```bash
# Apply the ArgoCD application
kubectl apply -f argocd-apps/monitoring-app.yaml

# Check deployment status
kubectl get applications -n argocd
kubectl describe application gigmatch-monitoring -n argocd
```

### 3. Monitor Deployment
```bash
# Check monitoring namespace
kubectl get all -n monitoring

# Check ArgoCD sync status
kubectl get applications gigmatch-monitoring -n argocd -o yaml
```

## 🔧 Manual Helm Deployment (Alternative)

### 1. Add Helm Repository (if using external charts)
```bash
# For Prometheus Operator (alternative approach)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

### 2. Deploy with Helm CLI
```bash
# Navigate to monitoring chart
cd helm/monitoring

# Install the chart
helm install gigmatch-monitoring . \
  --namespace monitoring \
  --create-namespace \
  --values values.yaml

# Or with custom values
helm install gigmatch-monitoring . \
  --namespace monitoring \
  --create-namespace \
  --values values.yaml \
  --set grafana.adminPassword=your-secure-password
```

### 3. Upgrade Existing Deployment
```bash
helm upgrade gigmatch-monitoring . \
  --namespace monitoring \
  --values values.yaml
```

## 📊 Configuration Options

### Environment-Specific Values

Create environment-specific value files:

**values-production.yaml:**
```yaml
global:
  namespaceOverride: "monitoring-prod"

grafana:
  adminPassword: "your-secure-production-password"
  persistence:
    size: 20Gi

prometheus:
  persistence:
    size: 50Gi
  resources:
    limits:
      memory: "1Gi"
      cpu: "1000m"

ingress:
  enabled: true
  hosts:
    - host: grafana.gigmatch.com
    - host: prometheus.gigmatch.com
```

**values-staging.yaml:**
```yaml
global:
  namespaceOverride: "monitoring-staging"

grafana:
  adminPassword: "staging-password"
  persistence:
    size: 10Gi

prometheus:
  persistence:
    size: 20Gi
```

### ArgoCD Application with Environment Values
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: gigmatch-monitoring-prod
spec:
  source:
    repoURL: https://github.com/your-username/mern-gigmatch.git
    path: helm/monitoring
    helm:
      valueFiles:
        - values-production.yaml
```

## 🔍 Accessing Monitoring Tools

### 1. Add Host Entries
```bash
# Add to /etc/hosts
127.0.0.1 grafana.gigmatch.local
127.0.0.1 prometheus.gigmatch.local
```

### 2. Port Forward (if not using ingress)
```bash
# Grafana
kubectl port-forward svc/gigmatch-monitoring-grafana 3000:3000 -n monitoring

# Prometheus
kubectl port-forward svc/gigmatch-monitoring-prometheus 9090:9090 -n monitoring
```

### 3. Access URLs
- **Grafana**: http://grafana.gigmatch.local (admin/admin123)
- **Prometheus**: http://prometheus.gigmatch.local

## 📈 Setting Up Dashboards

### 1. Import Recommended Dashboards in Grafana

**Node Exporter Full (ID: 1860)**
- System metrics dashboard
- CPU, memory, disk, network

**MongoDB Overview (ID: 2583)**
- Database performance metrics
- Connection stats, query performance

**Kubernetes Cluster Monitoring (ID: 315)**
- Cluster-wide metrics
- Pod and service health

### 2. Import Steps
1. Go to Grafana (http://grafana.gigmatch.local)
2. Login with admin/admin123
3. Click "+" → "Import"
4. Enter dashboard ID or upload JSON
5. Select Prometheus as data source

## 🔧 Customization

### Adding Custom Metrics (Without Code Changes)

**1. Service Discovery Configuration**
The Prometheus configuration automatically discovers your GigMatch services:
```yaml
# In values.yaml
prometheus:
  config:
    scrape_configs:
      - job_name: 'gigmatch-backend'
        kubernetes_sd_configs:
          - role: endpoints
        relabel_configs:
          - source_labels: [__meta_kubernetes_namespace]
            action: keep
            regex: gigmatch
          - source_labels: [__meta_kubernetes_service_name]
            action: keep
            regex: gigmatch-backend
```

**2. Add Metrics Endpoints Later**
If you decide to add metrics endpoints to your application later:
```yaml
# In your backend deployment
spec:
  template:
    spec:
      containers:
      - name: backend
        ports:
        - containerPort: 5000
        - containerPort: 9090  # Add metrics port
```

### Custom Dashboards

**1. Create Custom Dashboard ConfigMap**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: custom-dashboards
  namespace: monitoring
data:
  gigmatch-dashboard.json: |
    {
      "dashboard": {
        "title": "GigMatch Application Dashboard",
        "panels": [
          {
            "title": "HTTP Request Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "rate(http_requests_total[5m])",
                "legendFormat": "{{method}} {{route}}"
              }
            ]
          }
        ]
      }
    }
```

**2. Mount in Grafana**
```yaml
# In values.yaml
grafana:
  dashboards:
    custom:
      gigmatch-dashboard:
        file: gigmatch-dashboard.json
```

## 🔒 Security Considerations

### Production Security Settings
```yaml
# In values-production.yaml
grafana:
  adminPassword: "your-secure-password"
  allowSignUp: false

rbac:
  enabled: true
  create: true

securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000

# Use secrets for sensitive data
prometheus:
  config:
    scrape_configs:
      - job_name: 'secure-endpoint'
        tls_config:
          ca_file: /etc/prometheus/certs/ca.crt
        bearer_token_file: /etc/prometheus/tokens/token
```

### Network Policies
```yaml
# Create network policies to restrict access
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: monitoring-network-policy
  namespace: monitoring
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: monitoring
      ports:
        - protocol: TCP
          port: 9090
        - protocol: TCP
          port: 3000
```

## 🧹 Cleanup

### Remove ArgoCD Application
```bash
kubectl delete application gigmatch-monitoring -n argocd
```

### Remove Helm Release
```bash
helm uninstall gigmatch-monitoring -n monitoring
kubectl delete namespace monitoring
```

## 🔍 Troubleshooting

### Common Issues

**1. Prometheus Can't Scrape Targets**
```bash
# Check Prometheus targets
kubectl port-forward svc/gigmatch-monitoring-prometheus 9090:9090 -n monitoring
# Then visit http://localhost:9090/targets

# Check service discovery
kubectl get endpoints -n gigmatch
kubectl get services -n gigmatch
```

**2. Grafana Can't Connect to Prometheus**
```bash
# Check Grafana logs
kubectl logs -l app.kubernetes.io/component=grafana -n monitoring

# Check Prometheus service
kubectl get svc gigmatch-monitoring-prometheus -n monitoring
```

**3. Persistent Volume Issues**
```bash
# Check PVC status
kubectl get pvc -n monitoring

# Check storage class
kubectl get storageclass
```

### Useful Commands
```bash
# Check all monitoring resources
kubectl get all -n monitoring

# Check ArgoCD sync status
kubectl get applications -n argocd
kubectl describe application gigmatch-monitoring -n argocd

# Check Helm release
helm list -n monitoring
helm status gigmatch-monitoring -n monitoring

# View logs
kubectl logs -l app.kubernetes.io/component=prometheus -n monitoring
kubectl logs -l app.kubernetes.io/component=grafana -n monitoring
```

## 📚 Next Steps

1. **Import recommended dashboards** in Grafana
2. **Configure alerts** for critical thresholds
3. **Set up log aggregation** (ELK stack)
4. **Create business-specific dashboards**
5. **Configure backup and retention policies**
6. **Set up monitoring for your CI/CD pipeline**

## 🎯 Benefits of This Approach

✅ **No Code Changes Required** - Monitoring is deployed separately
✅ **GitOps Workflow** - ArgoCD manages deployment from Git
✅ **Environment Consistency** - Same configuration across environments
✅ **Easy Scaling** - Helm makes it easy to scale components
✅ **Version Control** - All configuration in Git
✅ **Rollback Capability** - Easy to rollback to previous versions 