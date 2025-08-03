# Kubernetes Deployment Analysis & Best Practices for MERN Stack

## 🔍 Current Issues Analysis

### 1. **Port Configuration Inconsistencies**

**Problem Identified:**
- **Backend code**: Uses port 5001 (due to AirPlay conflict on Mac)
- **Dockerfile**: Exposes port 5000
- **Helm values**: Mix of 5000 and 5001
- **Docker Compose**: Uses port 5000

**Root Cause:**
The port mismatch between your local development (5001) and containerized deployment (5000) is causing confusion and potential connection issues.

### 2. **Database Connectivity Issues**

**Problem Identified:**
- Backend tries to connect to `localhost:27017` instead of Kubernetes service
- Environment variables not properly injected into containers
- MongoDB service name resolution issues

---

## 🎯 Recommended Best Practices

### 1. **Standardize Port Configuration**

**Recommendation: Use Port 5000 for Backend**
```yaml
# Backend server.js
const PORT = process.env.PORT || 5000;

# Backend Dockerfile
EXPOSE 5000

# Helm values.yaml
gigmatch-backend:
  env:
    PORT: 5000
  service:
    port: 5000
```

**Why Port 5000?**
- Standard port for Node.js/Express applications
- No conflicts in containerized environments
- Consistent across development and production
- Better compatibility with Helm charts and Kubernetes

### 2. **Environment Variable Management**

**Best Practice: Use Kubernetes Secrets and ConfigMaps**
```yaml
# Create ConfigMap for non-sensitive data
apiVersion: v1
kind: ConfigMap
metadata:
  name: gigmatch-config
data:
  NODE_ENV: "production"
  FRONTEND_URL: "http://localhost:3000"

---
# Create Secret for sensitive data
apiVersion: v1
kind: Secret
metadata:
  name: gigmatch-secrets
type: Opaque
data:
  MONGODB_URI: <base64-encoded-connection-string>
  JWT_SECRET: <base64-encoded-jwt-secret>
```

### 3. **Database Connection Strategy**

**Best Practice: Use Service Discovery**
```yaml
# Helm values.yaml
gigmatch-backend:
  env:
    MONGODB_URI: "mongodb://gigmatch-mongodb:27017/gigmatch"
    # Use service name, not localhost
```

**Why Service Discovery?**
- Kubernetes automatically resolves service names
- No hardcoded IPs or localhost references
- Scalable and maintainable

### 4. **Container Health Checks**

**Best Practice: Add Health Checks**
```yaml
# In deployment.yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /api/health
    port: 5000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 5. **Resource Management**

**Best Practice: Set Resource Limits**
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

---

## 🚀 Recommended Deployment Architecture

### 1. **Three-Tier Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    MongoDB      │
│   (React/NGINX) │◄──►│   (Node.js)     │◄──►│   (Database)    │
│   Port: 80      │    │   Port: 5000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2. **Helm Chart Structure**
```
gigmatch/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment-backend.yaml
│   ├── deployment-frontend.yaml
│   ├── service-backend.yaml
│   ├── service-frontend.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── ingress.yaml
└── charts/
    ├── gigmatch-backend/
    ├── gigmatch-frontend/
    └── mongodb/
```

### 3. **Network Policy**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: gigmatch-network-policy
spec:
  podSelector:
    matchLabels:
      app: gigmatch
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 5000
```

---

## 🔧 Implementation Steps

### 1. **Fix Port Configuration**
```bash
# Update backend server.js
sed -i 's/PORT || 5001/PORT || 5000/' backend/server.js

# Update Dockerfile
sed -i 's/EXPOSE 5001/EXPOSE 5000/' backend/Dockerfile

# Update Helm values
# Set all backend ports to 5000
```

### 2. **Rebuild and Push Images**
```bash
docker build -t your-registry/gigmatch-backend:latest ./backend
docker build -t your-registry/gigmatch-frontend:latest ./frontend
docker push your-registry/gigmatch-backend:latest
docker push your-registry/gigmatch-frontend:latest
```

### 3. **Update Helm Charts**
```bash
helm dependency update
helm upgrade gigmatch . --force
```

### 4. **Verify Deployment**
```bash
kubectl get pods
kubectl logs -f deployment/gigmatch-backend
kubectl exec -it deployment/gigmatch-backend -- printenv | grep MONGODB_URI
```

---

## 🛡️ Security Best Practices

### 1. **Use Secrets for Sensitive Data**
- Never hardcode passwords or API keys
- Use Kubernetes Secrets or external secret managers
- Rotate secrets regularly

### 2. **Network Security**
- Use NetworkPolicies to restrict pod-to-pod communication
- Implement TLS for all external communications
- Use service mesh (Istio/Linkerd) for advanced traffic management

### 3. **Container Security**
- Use non-root users in containers
- Scan images for vulnerabilities
- Keep base images updated

---

## 📊 Monitoring and Observability

### 1. **Add Logging**
```yaml
# In deployment.yaml
env:
- name: LOG_LEVEL
  value: "info"
```

### 2. **Add Metrics**
- Use Prometheus for metrics collection
- Add custom metrics for business logic
- Set up Grafana dashboards

### 3. **Add Tracing**
- Implement distributed tracing (Jaeger/Zipkin)
- Track request flows across services

---

## 🎯 Production Checklist

- [ ] Standardize all ports (5000 for backend, 80 for frontend)
- [ ] Use Kubernetes Secrets for sensitive data
- [ ] Implement health checks
- [ ] Set resource limits
- [ ] Configure network policies
- [ ] Set up monitoring and logging
- [ ] Implement backup strategy for MongoDB
- [ ] Configure auto-scaling
- [ ] Set up CI/CD pipeline
- [ ] Test disaster recovery procedures

---

## 🔄 Migration Strategy

1. **Phase 1**: Fix port configuration and rebuild images
2. **Phase 2**: Update Helm charts with proper environment variables
3. **Phase 3**: Implement security best practices
4. **Phase 4**: Add monitoring and observability
5. **Phase 5**: Optimize for production scale

---

**Key Takeaway**: The main issue is port inconsistency between local development and containerized deployment. Standardizing on port 5000 for backend and using proper Kubernetes service discovery will resolve most connectivity issues. 

---

## 📁 Complete Kubernetes Manifests (Without Helm)

### 1. **Namespace**
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: gigmatch
  labels:
    name: gigmatch
```

### 2. **ConfigMap for Non-Sensitive Data**
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: gigmatch-config
  namespace: gigmatch
data:
  NODE_ENV: "production"
  FRONTEND_URL: "http://localhost:3000"
  PORT: "5000"
```

### 3. **Secret for Sensitive Data**
```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: gigmatch-secrets
  namespace: gigmatch
type: Opaque
data:
  MONGODB_URI: bW9uZ29kYjovL2dpZ21hdGNoLW1vbmdvZGI6MjcwMTcvZ2lnbWF0Y2g=
  JWT_SECRET: <base64-encoded-jwt-secret>
```

### 4. **MongoDB Deployment**
```yaml
# mongodb-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: gigmatch
  labels:
    app: mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:6
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_DATABASE
          value: "gigmatch"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        volumeMounts:
        - name: mongodb-data
          mountPath: /data/db
      volumes:
      - name: mongodb-data
        persistentVolumeClaim:
          claimName: mongodb-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb
  namespace: gigmatch
spec:
  selector:
    app: mongodb
  ports:
  - port: 27017
    targetPort: 27017
  type: ClusterIP
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
  namespace: gigmatch
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

### 5. **Backend Deployment**
```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gigmatch-backend
  namespace: gigmatch
  labels:
    app: gigmatch-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: gigmatch-backend
  template:
    metadata:
      labels:
        app: gigmatch-backend
    spec:
      containers:
      - name: backend
        image: your-registry/gigmatch-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: gigmatch-secrets
              key: MONGODB_URI
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: gigmatch-secrets
              key: JWT_SECRET
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: gigmatch-config
              key: NODE_ENV
        - name: PORT
          valueFrom:
            configMapKeyRef:
              name: gigmatch-config
              key: PORT
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: gigmatch-backend
  namespace: gigmatch
spec:
  selector:
    app: gigmatch-backend
  ports:
  - port: 5000
    targetPort: 5000
  type: ClusterIP
```

### 6. **Frontend Deployment**
```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gigmatch-frontend
  namespace: gigmatch
  labels:
    app: gigmatch-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: gigmatch-frontend
  template:
    metadata:
      labels:
        app: gigmatch-frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/gigmatch-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: gigmatch-frontend
  namespace: gigmatch
spec:
  selector:
    app: gigmatch-frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

### 7. **Ingress Controller**
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: gigmatch-ingress
  namespace: gigmatch
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: nginx
  rules:
  - host: gigmatch.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gigmatch-frontend
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: gigmatch-backend
            port:
              number: 5000
```

### 8. **Network Policy**
```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: gigmatch-network-policy
  namespace: gigmatch
spec:
  podSelector:
    matchLabels:
      app: gigmatch
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 5000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: mongodb
    ports:
    - protocol: TCP
      port: 27017
```

### 9. **Horizontal Pod Autoscaler**
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: gigmatch-backend-hpa
  namespace: gigmatch
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: gigmatch-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 📁 Complete Helm Chart Structure (With Helm)

### **Directory Structure:**
```
gigmatch/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── _helpers.tpl
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── mongodb-deployment.yaml
│   ├── mongodb-service.yaml
│   ├── mongodb-pvc.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── ingress.yaml
│   ├── network-policy.yaml
│   ├── hpa.yaml
│   └── NOTES.txt
└── charts/
    └── (dependencies)
```

### **Chart.yaml:**
```yaml
apiVersion: v2
name: gigmatch
description: A Helm chart for GigMatch MERN Stack
type: application
version: 0.1.0
appVersion: "1.0.0"
dependencies:
  - name: mongodb
    version: 13.6.4
    repository: https://charts.bitnami.com/bitnami
```

### **values.yaml:**
```yaml
# Global settings
global:
  namespace: gigmatch

# MongoDB settings
mongodb:
  auth:
    enabled: false
  persistence:
    enabled: true
    size: 1Gi
  resources:
    requests:
      memory: 256Mi
      cpu: 250m
    limits:
      memory: 512Mi
      cpu: 500m

# Backend settings
backend:
  image:
    repository: your-registry/gigmatch-backend
    tag: latest
    pullPolicy: IfNotPresent
  replicas: 2
  resources:
    requests:
      memory: 256Mi
      cpu: 250m
    limits:
      memory: 512Mi
      cpu: 500m
  env:
    MONGODB_URI: "mongodb://gigmatch-mongodb:27017/gigmatch"
    NODE_ENV: "production"
    PORT: "5000"
  service:
    type: ClusterIP
    port: 5000
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70

# Frontend settings
frontend:
  image:
    repository: your-registry/gigmatch-frontend
    tag: latest
    pullPolicy: IfNotPresent
  replicas: 2
  resources:
    requests:
      memory: 128Mi
      cpu: 100m
    limits:
      memory: 256Mi
      cpu: 200m
  service:
    type: ClusterIP
    port: 80

# Ingress settings
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
  hosts:
    - host: gigmatch.local
      paths:
        - path: /
          pathType: Prefix
        - path: /api
          pathType: Prefix

# Network Policy
networkPolicy:
  enabled: true

# Secrets
secrets:
  jwtSecret: "your-super-secret-jwt-key"
```

### **Deployment Commands:**

**Without Helm:**
```bash
# Apply all manifests
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f network-policy.yaml
kubectl apply -f hpa.yaml
```

**With Helm:**
```bash
# Install
helm install gigmatch .

# Upgrade
helm upgrade gigmatch .

# Uninstall
helm uninstall gigmatch
```

---

## 🔧 Deployment Scripts

### **deploy.sh (Without Helm):**
```bash
#!/bin/bash
set -e

echo "Deploying GigMatch to Kubernetes..."

# Create namespace
kubectl apply -f namespace.yaml

# Apply secrets and configs
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# Deploy MongoDB
kubectl apply -f mongodb-deployment.yaml

# Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n gigmatch --timeout=300s

# Deploy backend
kubectl apply -f backend-deployment.yaml

# Deploy frontend
kubectl apply -f frontend-deployment.yaml

# Apply ingress and network policies
kubectl apply -f ingress.yaml
kubectl apply -f network-policy.yaml
kubectl apply -f hpa.yaml

echo "Deployment complete!"
echo "Access your app at: http://gigmatch.local"
```

### **deploy-helm.sh:**
```bash
#!/bin/bash
set -e

echo "Deploying GigMatch with Helm..."

# Update dependencies
helm dependency update

# Install/upgrade
helm upgrade --install gigmatch . --namespace gigmatch --create-namespace

echo "Deployment complete!"
echo "Access your app at: http://gigmatch.local"
```

---

**Choose your deployment method based on your needs:**
- **Without Helm**: More control, explicit manifests, easier to understand
- **With Helm**: Easier management, templating, version control, better for complex deployments
- **With ArgoCD**: GitOps approach, automated deployments, declarative configuration

---

## 🚀 ArgoCD Deployment Guide

### **What is ArgoCD?**
ArgoCD is a GitOps continuous delivery tool for Kubernetes that automatically syncs your cluster state with your Git repository. It provides:
- **Declarative GitOps**: Your Git repository is the single source of truth
- **Automated Sync**: Automatic deployment when code changes
- **Rollback Capability**: Easy rollback to previous versions
- **Multi-cluster Support**: Manage multiple Kubernetes clusters
- **Web UI**: Visual interface for monitoring deployments

### **Prerequisites:**
1. Kubernetes cluster (Minikube, GKE, EKS, AKS, etc.)
2. kubectl configured to access your cluster
3. Git repository with Kubernetes manifests
4. ArgoCD installed on your cluster

---

## 📋 ArgoCD Installation Steps

### **1. Install ArgoCD on Kubernetes**

```bash
# Create namespace for ArgoCD
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for all pods to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s
```

### **2. Access ArgoCD UI**

```bash
# Port forward ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access UI at: https://localhost:8080
# Username: admin
# Password: (from command above)
```

### **3. Install ArgoCD CLI (Optional)**

```bash
# macOS
brew install argocd

# Linux
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64

# Login via CLI
argocd login localhost:8080 --username admin --password <password>
```

---

## 🔧 ArgoCD Application Configuration

### **Current ArgoCD Application Manifest (argocd-app.yaml):**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: gigmatch
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: 'https://github.com/fred4impact/mern-gigmatch.git'
    targetRevision: feature-dev
    path: k8s
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: gigmatch
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true
  revisionHistoryLimit: 10
```

### **Configuration Explanation:**

- **repoURL**: Your GitHub repository URL
- **targetRevision**: Git branch/tag to track (currently `feature-dev`)
- **path**: Directory containing Kubernetes manifests (`k8s/`)
- **namespace**: Target namespace for deployment (`gigmatch`)
- **automated**: Enables automatic sync when Git changes
- **prune**: Removes resources not in Git
- **selfHeal**: Automatically corrects drift from Git state

---

## 🚀 Deploy with ArgoCD

### **Method 1: Using kubectl**

```bash
# Apply the ArgoCD application
kubectl apply -f argocd-app.yaml

# Check application status
kubectl get applications -n argocd
kubectl describe application gigmatch -n argocd
```

### **Method 2: Using ArgoCD CLI**

```bash
# Create application
argocd app create gigmatch \
  --repo https://github.com/fred4impact/mern-gigmatch.git \
  --path k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace gigmatch \
  --revision feature-dev

# Enable auto-sync
argocd app set gigmatch --sync-policy automated

# Sync application
argocd app sync gigmatch
```

### **Method 3: Using ArgoCD UI**

1. Open ArgoCD UI (https://localhost:8080)
2. Click "New App"
3. Fill in the details:
   - **Application Name**: gigmatch
   - **Project**: default
   - **Repository URL**: https://github.com/fred4impact/mern-gigmatch.git
   - **Revision**: feature-dev
   - **Path**: k8s
   - **Destination**: https://kubernetes.default.svc
   - **Namespace**: gigmatch
4. Enable "Auto-sync" and "Prune"
5. Click "Create"

---

## 📊 Monitor Deployment

### **Check Application Status:**

```bash
# Via kubectl
kubectl get applications -n argocd
kubectl describe application gigmatch -n argocd

# Via ArgoCD CLI
argocd app list
argocd app get gigmatch
argocd app logs gigmatch

# Via ArgoCD UI
# Navigate to the gigmatch application in the UI
```

### **Check Resource Status:**

```bash
# Check all resources in gigmatch namespace
kubectl get all -n gigmatch

# Check specific deployments
kubectl get deployments -n gigmatch
kubectl get pods -n gigmatch
kubectl get services -n gigmatch

# Check logs
kubectl logs -f deployment/gigmatch-backend -n gigmatch
kubectl logs -f deployment/gigmatch-frontend -n gigmatch
```

---

## 🔄 GitOps Workflow

### **Development Workflow:**

1. **Make Changes**: Update your Kubernetes manifests in the `k8s/` directory
2. **Commit & Push**: Push changes to your Git repository
3. **Automatic Sync**: ArgoCD automatically detects changes and syncs
4. **Monitor**: Check deployment status in ArgoCD UI

### **Example Workflow:**

```bash
# 1. Make changes to manifests
vim k8s/backend-deployment.yaml

# 2. Commit and push
git add k8s/backend-deployment.yaml
git commit -m "Update backend deployment"
git push origin feature-dev

# 3. ArgoCD automatically syncs (if auto-sync is enabled)
# 4. Monitor in ArgoCD UI or CLI
argocd app sync gigmatch
```

---

## 🛠️ Advanced ArgoCD Features

### **1. Sync Options**

```yaml
syncOptions:
  - CreateNamespace=true          # Create namespace if it doesn't exist
  - PrunePropagationPolicy=foreground  # Wait for resources to be deleted
  - PruneLast=true               # Prune after all resources are created
  - Validate=true                # Validate manifests before applying
```

### **2. Sync Policies**

```yaml
syncPolicy:
  automated:
    prune: true                  # Remove resources not in Git
    selfHeal: true              # Automatically correct drift
    allowEmpty: false           # Don't allow empty applications
  retry:
    limit: 5                    # Retry failed syncs
    backoff:
      duration: 5s              # Wait between retries
      factor: 2                 # Exponential backoff
      maxDuration: 3m           # Maximum wait time
```

### **3. Application Sets (for multiple environments)**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: gigmatch-environments
  namespace: argocd
spec:
  generators:
  - list:
      elements:
      - env: development
        namespace: gigmatch-dev
        branch: develop
      - env: staging
        namespace: gigmatch-staging
        branch: staging
      - env: production
        namespace: gigmatch-prod
        branch: main
  template:
    metadata:
      name: 'gigmatch-{{env}}'
    spec:
      project: default
      source:
        repoURL: 'https://github.com/fred4impact/mern-gigmatch.git'
        targetRevision: '{{branch}}'
        path: k8s
      destination:
        server: 'https://kubernetes.default.svc'
        namespace: '{{namespace}}'
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

---

## 🔧 Troubleshooting

### **Common Issues:**

1. **Application Stuck in Progress**
   ```bash
   # Check application events
   kubectl describe application gigmatch -n argocd
   
   # Check resource events
   kubectl get events -n gigmatch --sort-by='.lastTimestamp'
   ```

2. **Sync Failed**
   ```bash
   # Check sync logs
   argocd app logs gigmatch
   
   # Force sync
   argocd app sync gigmatch --force
   ```

3. **Resources Not Created**
   ```bash
   # Check if namespace exists
   kubectl get namespace gigmatch
   
   # Check application status
   argocd app get gigmatch
   ```

4. **Image Pull Errors**
   ```bash
   # Check pod events
   kubectl describe pod -l app=gigmatch-backend -n gigmatch
   
   # Check image pull secrets
   kubectl get secrets -n gigmatch
   ```

---

## 📈 Best Practices

### **1. Repository Structure**
```
your-repo/
├── k8s/                    # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── ingress.yaml
├── argocd-app.yaml         # ArgoCD application
└── README.md
```

### **2. Branch Strategy**
- **main**: Production manifests
- **staging**: Staging environment
- **develop**: Development environment
- **feature-***: Feature branches

### **3. Security**
- Use private repositories for sensitive manifests
- Implement RBAC for ArgoCD users
- Use external secret management (Sealed Secrets, External Secrets Operator)

### **4. Monitoring**
- Set up alerts for sync failures
- Monitor application health
- Use ArgoCD notifications for deployment events

---

## 🎯 Complete ArgoCD Deployment Checklist

- [ ] Install ArgoCD on Kubernetes cluster
- [ ] Configure ArgoCD application manifest
- [ ] Set up Git repository with Kubernetes manifests
- [ ] Create ArgoCD application
- [ ] Enable auto-sync
- [ ] Test deployment workflow
- [ ] Set up monitoring and alerts
- [ ] Configure RBAC and security
- [ ] Document deployment procedures
- [ ] Train team on GitOps workflow

---

## 🚀 Quick Start Commands

```bash
# 1. Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 2. Wait for ArgoCD to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# 3. Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# 4. Port forward ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# 5. Apply your application
kubectl apply -f argocd-app.yaml

# 6. Access ArgoCD UI at https://localhost:8080
# Username: admin
# Password: (from step 3)
```

**ArgoCD provides a powerful GitOps solution that automates your Kubernetes deployments and ensures your cluster state matches your Git repository!**

---

## 🤔 **Common ArgoCD Questions & Clarifications**

### **Q: Do I need to manually deploy manifests first before using ArgoCD?**

**A: NO!** That's the beauty of GitOps. ArgoCD automatically handles everything.

#### **What ArgoCD Does Automatically:**
1. **Reads your Git repository** - Looks at the `k8s/` directory
2. **Compares with cluster state** - Sees what's missing or different
3. **Applies all manifests** - Creates/updates everything in the correct order
4. **Manages dependencies** - Handles namespace creation, secrets, etc.

#### **The Process:**
```bash
# 1. Just apply the ArgoCD application
kubectl apply -f argocd-app.yaml

# 2. ArgoCD automatically:
#    - Creates the gigmatch namespace (if it doesn't exist)
#    - Applies all manifests from k8s/ directory
#    - Handles the correct order (namespace → secrets → deployments → services)
```

#### **What Happens When You Apply argocd-app.yaml:**

ArgoCD will automatically create and manage:
- ✅ **Namespace**: `gigmatch` (via `CreateNamespace=true`)
- ✅ **ConfigMap**: `gigmatch-config`
- ✅ **Secret**: `gigmatch-secret`
- ✅ **MongoDB**: Deployment, Service, PVC
- ✅ **Backend**: Deployment, Service
- ✅ **Frontend**: Deployment, Service
- ✅ **Ingress**: Network routing
- ✅ **Network Policy**: Security rules
- ✅ **HPA**: Auto-scaling

#### **GitOps Workflow:**

```bash
# 1. Your current state: k8s/ directory has all manifests
# 2. Apply ArgoCD application
kubectl apply -f argocd-app.yaml

# 3. ArgoCD automatically syncs and creates everything
# 4. Monitor the sync
kubectl get applications -n argocd
argocd app sync gigmatch  # if needed

# 5. Check your resources
kubectl get all -n gigmatch
```

#### **Benefits of This Approach:**

1. **Declarative**: You declare what you want in Git, ArgoCD makes it happen
2. **Idempotent**: Safe to run multiple times
3. **Order Management**: ArgoCD handles dependency order automatically
4. **Drift Detection**: If someone manually changes the cluster, ArgoCD will correct it
5. **Audit Trail**: All changes are tracked in Git

#### **Monitor the Deployment:**

```bash
# Check ArgoCD application status
kubectl get applications -n argocd
kubectl describe application gigmatch -n argocd

# Check if resources are being created
kubectl get all -n gigmatch

# Watch the sync process
argocd app logs gigmatch -f
```

#### **Important Notes:**

1. **Make sure your secrets are properly configured** in `k8s/secret.yaml`
2. **Ensure your Docker images exist** and are accessible
3. **Check that your repository is public** or ArgoCD has access to it
4. **Verify the branch name** in `argocd-app.yaml` matches your current branch

#### **Quick Start:**

```bash
# Just run this one command
kubectl apply -f argocd-app.yaml

# Then monitor
kubectl get applications -n argocd
kubectl get all -n gigmatch
```

**That's it!** ArgoCD will handle the rest automatically. This is the beauty of GitOps - you declare your desired state in Git, and ArgoCD makes your cluster match that state.

---

## 🔄 **ArgoCD vs Manual Deployment Comparison**

### **Manual Deployment (Traditional Way):**
```bash
# Need to apply each manifest manually in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
# ... and so on
```

### **ArgoCD GitOps Way:**
```bash
# Just one command
kubectl apply -f argocd-app.yaml
# ArgoCD handles everything else automatically
```

### **Key Differences:**

| Aspect | Manual Deployment | ArgoCD GitOps |
|--------|------------------|---------------|
| **Deployment** | Manual, step-by-step | Automatic, declarative |
| **Order Management** | You must know dependencies | ArgoCD handles it |
| **Drift Detection** | Manual checking required | Automatic correction |
| **Rollback** | Manual process | Git-based rollback |
| **Audit Trail** | Limited | Full Git history |
| **Multi-environment** | Copy-paste manifests | Git branches |
| **Team Collaboration** | Manual coordination | Git-based workflow |

---

## 🎯 **ArgoCD Best Practices for Your Project**

### **1. Repository Structure**
```
mern-gigmatch/
├── k8s/                    # ✅ Your current structure
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── mongodb-deployment.yaml
│   ├── ingress.yaml
│   ├── network-policy.yaml
│   └── hpa.yaml
├── argocd-app.yaml         # ✅ ArgoCD application
├── backend/                # ✅ Application code
├── frontend/               # ✅ Application code
└── README.md
```

### **2. Branch Strategy for GitOps**
```
main/                      # Production manifests
├── k8s/
│   └── (production configs)
└── argocd-app.yaml        # Points to main branch

staging/                   # Staging manifests
├── k8s/
│   └── (staging configs)
└── argocd-app.yaml        # Points to staging branch

feature-dev/               # ✅ Your current branch
├── k8s/
│   └── (development configs)
└── argocd-app.yaml        # Points to feature-dev branch
```

### **3. Environment-Specific Configurations**

#### **Development (feature-dev branch):**
```yaml
# k8s/configmap.yaml
data:
  NODE_ENV: "development"
  FRONTEND_URL: "http://localhost:3000"
  PORT: "5000"
```

#### **Production (main branch):**
```yaml
# k8s/configmap.yaml
data:
  NODE_ENV: "production"
  FRONTEND_URL: "https://gigmatch.com"
  PORT: "5000"
```

### **4. ArgoCD Application Sets for Multiple Environments**

```yaml
# argocd-appset.yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: gigmatch-environments
  namespace: argocd
spec:
  generators:
  - list:
      elements:
      - env: development
        namespace: gigmatch-dev
        branch: feature-dev
        replicas: 1
      - env: staging
        namespace: gigmatch-staging
        branch: staging
        replicas: 2
      - env: production
        namespace: gigmatch-prod
        branch: main
        replicas: 3
  template:
    metadata:
      name: 'gigmatch-{{env}}'
    spec:
      project: default
      source:
        repoURL: 'https://github.com/fred4impact/mern-gigmatch.git'
        targetRevision: '{{branch}}'
        path: k8s
      destination:
        server: 'https://kubernetes.default.svc'
        namespace: '{{namespace}}'
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

---

## 🚀 **Complete ArgoCD Deployment Workflow**

### **Step 1: Install ArgoCD**
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s
```

### **Step 2: Access ArgoCD**
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
# Access: https://localhost:8080 (admin / password from above)
```

### **Step 3: Deploy Your Application**
```bash
# Apply ArgoCD application
kubectl apply -f argocd-app.yaml

# Monitor deployment
kubectl get applications -n argocd
kubectl get all -n gigmatch
```

### **Step 4: Verify Deployment**
```bash
# Check application status
argocd app get gigmatch

# Check resources
kubectl get pods -n gigmatch
kubectl get services -n gigmatch
kubectl get ingress -n gigmatch

# Check logs
kubectl logs -f deployment/gigmatch-backend -n gigmatch
kubectl logs -f deployment/gigmatch-frontend -n gigmatch
```

### **Step 5: Test Your Application**
```bash
# Get your application URL
kubectl get ingress -n gigmatch

# Or port forward for testing
kubectl port-forward svc/gigmatch-frontend -n gigmatch 3000:80
kubectl port-forward svc/gigmatch-backend -n gigmatch 5000:5000
```

---

## 🔧 **Troubleshooting ArgoCD Deployment**

### **Common Issues and Solutions:**

#### **1. Application Stuck in "Progressing" State**
```bash
# Check application events
kubectl describe application gigmatch -n argocd

# Check resource events
kubectl get events -n gigmatch --sort-by='.lastTimestamp'

# Check if namespace exists
kubectl get namespace gigmatch
```

#### **2. Sync Failed - Image Pull Errors**
```bash
# Check pod events
kubectl describe pod -l app=gigmatch-backend -n gigmatch

# Verify image exists
docker pull runtesting/gigmatch-backend:latest

# Check image pull secrets
kubectl get secrets -n gigmatch
```

#### **3. Sync Failed - Secret Not Found**
```bash
# Check if secret exists
kubectl get secret gigmatch-secret -n gigmatch

# Verify secret configuration
kubectl describe secret gigmatch-secret -n gigmatch

# Check if secret is properly referenced in deployment
kubectl get deployment gigmatch-backend -n gigmatch -o yaml | grep -A 10 -B 5 secretKeyRef
```

#### **4. Repository Access Issues**
```bash
# Check if repository is accessible
git ls-remote https://github.com/fred4impact/mern-gigmatch.git

# Verify branch exists
git ls-remote https://github.com/fred4impact/mern-gigmatch.git feature-dev

# Check ArgoCD repository configuration
argocd repo list
```

#### **5. Force Sync and Retry**
```bash
# Force sync application
argocd app sync gigmatch --force

# Check sync logs
argocd app logs gigmatch

# Retry failed sync
argocd app retry gigmatch
```

---

## 📈 **Monitoring and Observability**

### **1. ArgoCD Dashboard Metrics**
- Application sync status
- Resource health status
- Sync frequency
- Deployment history

### **2. Kubernetes Resource Monitoring**
```bash
# Monitor resource usage
kubectl top pods -n gigmatch
kubectl top nodes

# Check resource limits
kubectl describe pods -n gigmatch | grep -A 5 -B 5 "Limits:"
```

### **3. Application Health Checks**
```bash
# Check application endpoints
kubectl get endpoints -n gigmatch

# Test health endpoints
kubectl port-forward svc/gigmatch-backend -n gigmatch 5000:5000
curl http://localhost:5000/api/health
```

---

## 🎯 **Next Steps After ArgoCD Setup**

1. **Set up monitoring** (Prometheus, Grafana)
2. **Configure alerts** for sync failures
3. **Implement CI/CD pipeline** integration
4. **Set up backup strategies** for MongoDB
5. **Configure SSL/TLS** certificates
6. **Implement blue-green deployments**
7. **Set up multi-cluster deployments**

---

**Remember: ArgoCD makes Kubernetes deployments as simple as `git push`! Your Git repository becomes the single source of truth for your entire infrastructure.** 

use these as my mongodb service name 
echo -n "mongodb://mongodb:27017/gigmatch" | base64