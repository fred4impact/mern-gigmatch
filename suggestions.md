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