# Monitoring Stack Deployment via ArgoCD - Complete Guide

## **Overview**
This guide covers the complete deployment of a monitoring stack (Prometheus + Grafana) using ArgoCD, including troubleshooting steps and platform-specific considerations for Minikube and EKS.

## **Architecture**
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Node Exporter**: Node-level metrics
- **MongoDB Exporter**: Database metrics
- **ArgoCD**: GitOps deployment management

---

## **Prerequisites**

### **For All Platforms:**
- Kubernetes cluster running
- kubectl configured
- ArgoCD CLI installed
- Git repository access

### **For Minikube:**
```bash
# Start Minikube with sufficient resources
minikube start --memory=4096 --cpus=2 --disk-size=20g

# Enable ingress addon (optional)
minikube addons enable ingress
```

### **For EKS:**
```bash
# Configure AWS CLI
aws configure

# Create EKS cluster (if not exists)
eksctl create cluster --name gigmatch-cluster --region us-west-2 --nodes 3
```

---

## **Step 1: Install ArgoCD**

### **Create ArgoCD Namespace and Install:**
```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl get pods -n argocd -w
```

### **Access ArgoCD:**

#### **Minikube:**
```bash
# Port forward ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access: https://localhost:8080
# Username: admin
# Password: (from above command)
```

#### **EKS:**
```bash
# Patch service to use LoadBalancer
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# Get external IP
kubectl get svc -n argocd argocd-server

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access: https://<EXTERNAL-IP>
# Username: admin
# Password: (from above command)
```

### **Login to ArgoCD CLI:**
```bash
# For Minikube
argocd login localhost:8080 --insecure

# For EKS
argocd login <EXTERNAL-IP> --insecure
```

---

## **Step 2: Install Required Components**

### **Install Nginx Ingress Controller:**
```bash
# Install nginx ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Wait for ingress controller to be ready
kubectl get pods -n ingress-nginx -w
```

### **Install Metrics Server:**

#### **Minikube (with insecure TLS):**
```bash
# Install metrics server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Patch for Minikube (required for self-signed certificates)
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

# Wait for metrics server to be ready
kubectl wait --for=condition=ready pod -l k8s-app=metrics-server -n kube-system --timeout=300s
```

#### **EKS (standard installation):**
```bash
# Install metrics server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Wait for metrics server to be ready
kubectl wait --for=condition=ready pod -l k8s-app=metrics-server -n kube-system --timeout=300s
```

---

## **Step 3: Create Helm Monitoring Templates**

### **Create Service Account Template:**
```yaml
# File: helm/monitoring/templates/serviceaccount.yaml
{{- if .Values.serviceAccount.create -}}
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ include "gigmatch-monitoring.fullname" . }}
  namespace: {{ .Release.Namespace }}
  labels:
    {{- include "gigmatch-monitoring.labels" . | nindent 4 }}
{{- end }}
```

### **Create RBAC Template:**
```yaml
# File: helm/monitoring/templates/rbac.yaml
{{- if .Values.rbac.enabled -}}
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: {{ include "gigmatch-monitoring.fullname" . }}
  labels:
    {{- include "gigmatch-monitoring.labels" . | nindent 4 }}
rules:
  - apiGroups: [""]
    resources:
      - nodes
      - nodes/proxy
      - services
      - endpoints
      - pods
    verbs: ["get", "list", "watch"]
  - apiGroups:
      - extensions
    resources:
      - ingresses
    verbs: ["get", "list", "watch"]
  - nonResourceURLs: ["/metrics"]
    verbs: ["get"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: {{ include "gigmatch-monitoring.fullname" . }}
  labels:
    {{- include "gigmatch-monitoring.labels" . | nindent 4 }}
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: {{ include "gigmatch-monitoring.fullname" . }}
subjects:
  - kind: ServiceAccount
    name: {{ include "gigmatch-monitoring.fullname" . }}
    namespace: {{ .Release.Namespace }}
{{- end }}
```

---

## **Step 4: Create ArgoCD Application Manifest**

### **Create Monitoring Application:**
```yaml
# File: argocd-monitoring-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: gigmatch-monitoring
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/fred4impact/mern-gigmatch.git
    targetRevision: feature-dev  # Use your branch
    path: helm/monitoring
    helm:
      values: |
        global:
          namespaceOverride: "monitoring"
          nameOverride: "gigmatch-monitoring"
        
        prometheus:
          enabled: true
          persistence:
            enabled: true
            size: 5Gi
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
        
        grafana:
          enabled: true
          persistence:
            enabled: true
            size: 2Gi
          adminPassword: "admin123"
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          # Fix readiness probe timing
          livenessProbe:
            initialDelaySeconds: 60
            periodSeconds: 30
          readinessProbe:
            initialDelaySeconds: 30
            periodSeconds: 10
        
        nodeExporter:
          enabled: true
          resources:
            requests:
              memory: "64Mi"
              cpu: "100m"
            limits:
              memory: "128Mi"
              cpu: "200m"
        
        mongodbExporter:
          enabled: true
          mongodbUri: "mongodb://mongodb.gigmatch.svc.cluster.local:27017"
          resources:
            requests:
              memory: "64Mi"
              cpu: "100m"
            limits:
              memory: "128Mi"
              cpu: "200m"
        
        ingress:
          enabled: true
          className: "nginx"
          hosts:
            - host: grafana.gigmatch.local
              paths:
                - path: /
                  pathType: Prefix
            - host: prometheus.gigmatch.local
              paths:
                - path: /
                  pathType: Prefix
        
        rbac:
          enabled: true
          create: true
        
        serviceAccount:
          create: true
          name: "gigmatch-monitoring"
  
  destination:
    server: https://kubernetes.default.svc
    namespace: monitoring
  
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

---

## **Step 5: Deploy Monitoring Stack**

### **Apply ArgoCD Application:**
```bash
# Apply the ArgoCD monitoring application
kubectl apply -f argocd-monitoring-app.yaml

# Check application status
argocd app get gigmatch-monitoring
```

### **Troubleshooting Common Issues:**

#### **Issue 1: Service Account Not Found**
```bash
# Error: serviceaccount "gigmatch-monitoring" not found

# Solution: Create service account manually (if Helm templates not working)
kubectl create serviceaccount gigmatch-monitoring -n monitoring

# Create RBAC resources
kubectl create clusterrole gigmatch-monitoring --verb=get,list,watch --resource=nodes,services,endpoints,pods
kubectl create clusterrolebinding gigmatch-monitoring --clusterrole=gigmatch-monitoring --serviceaccount=monitoring:gigmatch-monitoring

# Restart deployment
kubectl rollout restart deployment/gigmatch-monitoring-prometheus -n monitoring
```

#### **Issue 2: Readiness Probe Failed**
```bash
# Error: Readiness probe failed: connection refused

# Solution: Increase probe timing in values
livenessProbe:
  initialDelaySeconds: 60
  periodSeconds: 30
readinessProbe:
  initialDelaySeconds: 30
  periodSeconds: 10
```

#### **Issue 3: Metrics Server Not Ready (Minikube)**
```bash
# Check metrics server status
kubectl get pods -n kube-system | grep metrics-server

# Apply insecure TLS patch
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

# Wait for ready
kubectl wait --for=condition=ready pod -l k8s-app=metrics-server -n kube-system --timeout=300s
```

#### **Issue 4: Ingress No ADDRESS (Minikube)**
```bash
# This is normal for Minikube - use port-forwarding instead
kubectl port-forward -n monitoring svc/gigmatch-monitoring-grafana 3001:3000
kubectl port-forward -n monitoring svc/gigmatch-monitoring-prometheus 9090:9090
```

---

## **Step 6: Verify Deployment**

### **Check All Resources:**
```bash
# Check pods
kubectl get pods -n monitoring

# Check services
kubectl get svc -n monitoring

# Check PVCs
kubectl get pvc -n monitoring

# Check ArgoCD application status
argocd app get gigmatch-monitoring
```

### **Expected Output:**
```
NAME                                           READY   STATUS    RESTARTS   AGE
gigmatch-monitoring-grafana-588b7c85b7-px2f4   1/1     Running   0          15m
gigmatch-monitoring-prometheus-7dbc5b9577-ph7cg 1/1     Running   0          47s
```

---

## **Step 7: Access Monitoring Tools**

### **Minikube Access:**
```bash
# Grafana Dashboard
kubectl port-forward -n monitoring svc/gigmatch-monitoring-grafana 3001:3000
# Access: http://localhost:3001
# Username: admin
# Password: admin123

# Prometheus
kubectl port-forward -n monitoring svc/gigmatch-monitoring-prometheus 9090:9090
# Access: http://localhost:9090
```

### **EKS Access:**
```bash
# Option 1: Use ingress (if configured)
# Add to /etc/hosts:
# <INGRESS-IP> grafana.gigmatch.local
# <INGRESS-IP> prometheus.gigmatch.local

# Option 2: Use port-forwarding (same as Minikube)
kubectl port-forward -n monitoring svc/gigmatch-monitoring-grafana 3001:3000
kubectl port-forward -n monitoring svc/gigmatch-monitoring-prometheus 9090:9090
```

---

## **Platform-Specific Considerations**

### **Minikube:**
- ✅ **Pros:** Easy setup, good for development
- ⚠️ **Limitations:** 
  - No external ingress IP
  - Limited resources
  - Self-signed certificates
- 🔧 **Required Patches:**
  - Metrics server insecure TLS
  - Use port-forwarding for access

### **EKS:**
- ✅ **Pros:** Production-ready, auto-scaling, load balancers
- ⚠️ **Considerations:**
  - Higher resource costs
  - More complex setup
  - Requires AWS configuration
- 🔧 **Benefits:**
  - Automatic ingress IP assignment
  - Better performance
  - Production-grade storage

---

## **Monitoring What's Being Monitored**

### **Kubernetes Metrics:**
- Node metrics (CPU, memory, disk)
- Pod metrics (resource usage)
- Service metrics (request/response)

### **Application Metrics:**
- GigMatch backend performance
- GigMatch frontend performance
- MongoDB database metrics

### **Infrastructure Metrics:**
- Cluster health
- Resource utilization
- Network performance

---

## **Useful Commands for Troubleshooting**

### **Check Pod Logs:**
```bash
# Grafana logs
kubectl logs -n monitoring -l app.kubernetes.io/component=grafana

# Prometheus logs
kubectl logs -n monitoring -l app.kubernetes.io/component=prometheus
```

### **Check Events:**
```bash
# Monitor events in real-time
kubectl get events -n monitoring --sort-by='.lastTimestamp' -w

# Check specific resource events
kubectl describe deployment gigmatch-monitoring-prometheus -n monitoring
```

### **Check Resource Usage:**
```bash
# Check pod resource usage
kubectl top pods -n monitoring

# Check node resource usage
kubectl top nodes
```

### **ArgoCD Commands:**
```bash
# Sync application
argocd app sync gigmatch-monitoring

# Check application status
argocd app get gigmatch-monitoring

# View application logs
argocd app logs gigmatch-monitoring
```

---

## **Cleanup Commands**

### **Remove Monitoring Stack:**
```bash
# Delete ArgoCD application
kubectl delete -f argocd-monitoring-app.yaml

# Or delete via ArgoCD CLI
argocd app delete gigmatch-monitoring
```

### **Remove ArgoCD:**
```bash
# Delete ArgoCD
kubectl delete namespace argocd
```

---

## **Summary**

This guide provides a complete walkthrough for deploying a monitoring stack via ArgoCD, with specific considerations for both Minikube (development) and EKS (production) environments. The key differences are:

1. **Minikube**: Requires patches for metrics server, uses port-forwarding for access
2. **EKS**: Standard installation, supports ingress with external IPs

The monitoring stack provides comprehensive visibility into your GigMatch application and infrastructure, enabling proactive monitoring and troubleshooting. 