# ArgoCD Deployment Guide for Different Cluster Types

## **Local Cluster (Minikube/Docker Desktop) Deployment**

### **Step 1: Install ArgoCD**
```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl get pods -n argocd -w
```

### **Step 2: Access ArgoCD**
```bash
# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access UI: https://localhost:8080
# Username: admin
# Password: (from above command)
```

### **Step 3: Install Required Components**
```bash
# Install nginx ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Install metrics server (with insecure TLS for local clusters)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
```

### **Step 4: Deploy Your Application**
```bash
# Apply your ArgoCD application
kubectl apply -f argocd-app.yaml

# Check status
argocd app get gigmatch
```

---

## **Cloud Cluster (EKS/AKS/GKE) Deployment**

### **Step 1: Install ArgoCD**
```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl get pods -n argocd -w
```

### **Step 2: Configure Load Balancer (EKS)**
```bash
# Patch ArgoCD server to use LoadBalancer
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# Get external IP
kubectl get svc -n argocd argocd-server
```

### **Step 3: Get Admin Password**
```bash
# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### **Step 4: Install Required Components**
```bash
# Install nginx ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Install metrics server (standard installation)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### **Step 5: Deploy Your Application**
```bash
# Apply your ArgoCD application
kubectl apply -f argocd-app.yaml

# Check status
argocd app get gigmatch
```

---

## **Key Differences Between Local and Cloud Clusters**

### **Local Clusters (Minikube/Docker Desktop)**
- **Ingress:** No external IP assigned, use port-forwarding
- **Metrics Server:** Requires `--kubelet-insecure-tls` flag
- **Storage:** Limited persistent storage options
- **Load Balancer:** Not available, use NodePort or port-forwarding

### **Cloud Clusters (EKS/AKS/GKE)**
- **Ingress:** Gets external IP automatically
- **Metrics Server:** Works with standard installation
- **Storage:** Full persistent storage support
- **Load Balancer:** Available and automatically provisioned

---

## **Troubleshooting Common Issues**

### **Local Cluster Issues**

#### **1. Metrics Server Not Ready**
```bash
# Check if metrics server is running
kubectl get pods -n kube-system | grep metrics-server

# Apply insecure TLS patch
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
```

#### **2. Ingress No ADDRESS**
```bash
# This is normal for local clusters
# Use port-forwarding instead:
kubectl port-forward -n gigmatch svc/gigmatch-frontend 3000:80
```

#### **3. ArgoCD Login Issues**
```bash
# For local clusters, use port-forwarding
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Login with insecure flag
argocd login localhost:8080 --insecure
```

### **Cloud Cluster Issues**

#### **1. Load Balancer Not Provisioned**
```bash
# Check if you have sufficient resources
kubectl get nodes
kubectl describe svc argocd-server -n argocd
```

#### **2. Ingress Not Working**
```bash
# Check ingress controller status
kubectl get pods -n ingress-nginx
kubectl describe ingress gigmatch-ingress -n gigmatch
```

---

## **Best Practices**

### **For Local Development**
1. Use port-forwarding for immediate access
2. Apply insecure TLS patches for metrics server
3. Use NodePort services when possible
4. Keep resource limits low

### **For Production**
1. Use proper ingress controllers
2. Configure SSL/TLS certificates
3. Set up monitoring and logging
4. Use resource quotas and limits
5. Implement proper RBAC

---

## **Quick Commands Reference**

### **Local Cluster Setup**
```bash
# Complete local setup
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### **Cloud Cluster Setup**
```bash
# Complete cloud setup
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
``` 