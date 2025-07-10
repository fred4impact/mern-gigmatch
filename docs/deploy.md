# Deployment Guide

## 1. Test Deploy on Linode (Docker Compose)

### Prerequisites
- Linode VM (Ubuntu or similar)
- Docker & Docker Compose installed
- Docker Hub credentials

### Steps
1. **Clone your repo:**
   ```sh
   git clone <your-repo-url>
   cd mern-gigmatch
   ```
2. **Create a `.env` file** for backend and frontend as needed.
3. **Create a `docker-compose.yml`:**
   ```yaml
   version: '3.8'
   services:
     mongo:
       image: mongo:5.0
       restart: always
       ports:
         - 27017:27017
       volumes:
         - mongo-data:/data/db
     backend:
       image: <your-dockerhub-username>/gigmatch-backend:latest
       restart: always
       env_file:
         - ./backend/.env
       ports:
         - 5000:5000
       depends_on:
         - mongo
     frontend:
       image: <your-dockerhub-username>/gigmatch-frontend:latest
       restart: always
       env_file:
         - ./frontend/.env
       ports:
         - 3000:80
   volumes:
     mongo-data:
   ```
4. **Run:**
   ```sh
   docker-compose up -d
   ```
5. **Access:**
   - Frontend: `http://<linode-ip>:3000`
   - Backend: `http://<linode-ip>:5000`

---

## 2. Deploy on Kubernetes with Helm & ArgoCD

### Prerequisites
- Kubernetes cluster (Linode, GKE, EKS, etc.)
- kubectl, Helm, and ArgoCD CLI installed
- Docker images pushed to Docker Hub

### Helm Chart Structure
```
helm/
  gigmatch/
    Chart.yaml
    values.yaml
    templates/
      deployment-backend.yaml
      deployment-frontend.yaml
      service-backend.yaml
      service-frontend.yaml
      ingress.yaml
      mongo-deployment.yaml
      mongo-service.yaml
```

### Example `values.yaml`
```yaml
backend:
  image: <your-dockerhub-username>/gigmatch-backend:latest
  tag: latest
  env:
    - name: MONGO_URI
      value: mongodb://mongo:27017/gigmatch
frontend:
  image: <your-dockerhub-username>/gigmatch-frontend:latest
  tag: latest
mongo:
  image: mongo:5.0
```

### Example Backend Deployment Template (`deployment-backend.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gigmatch-backend
spec:
  replicas: 1
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
          image: {{ .Values.backend.image }}:{{ .Values.backend.tag }}
          ports:
            - containerPort: 5000
          env:
            {{- toYaml .Values.backend.env | nindent 12 }}
```

### Deploy with Helm
```sh
helm install gigmatch ./helm/gigmatch -n gigmatch --create-namespace
```

### ArgoCD Steps
1. **Install ArgoCD** (if not already):
   https://argo-cd.readthedocs.io/en/stable/getting_started/
2. **Create an ArgoCD Application:**
   ```yaml
   apiVersion: argoproj.io/v1alpha1
   kind: Application
   metadata:
     name: gigmatch
     namespace: argocd
   spec:
     project: default
     source:
       repoURL: 'https://github.com/<your-org>/<your-repo>'
       targetRevision: HEAD
       path: helm/gigmatch
     destination:
       server: 'https://kubernetes.default.svc'
       namespace: gigmatch
     syncPolicy:
       automated:
         prune: true
         selfHeal: true
   ```
3. **Apply the ArgoCD app:**
   ```sh
   kubectl apply -f argocd-app.yaml
   ```
4. **Access the app:**
   - Use the configured ingress or service LoadBalancer IP.

---

**Adjust image names, environment variables, and ingress as needed for your environment.** 