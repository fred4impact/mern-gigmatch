# Deploying Backend on Kubernetes with Helm & ArgoCD (Minikube)

This guide walks you through deploying your backend (and optionally frontend) on Kubernetes using Helm charts and ArgoCD, with Minikube as your local cluster.

---

## 1. Prerequisites
- [Minikube](https://minikube.sigs.k8s.io/) installed and running
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- [Helm](https://helm.sh/) installed
- [ArgoCD CLI](https://argo-cd.readthedocs.io/en/stable/cli_installation/) (optional, for advanced usage)
- Your backend Docker image pushed to a registry (Docker Hub, ECR, etc.)

---

## 2. Start Minikube
```sh
minikube start
```

---

## 3. Install Helm (if not already)
```sh
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

---

## 4. Create a Helm Chart for Your Backend
```sh
helm create gigmatch-backend
```
- This creates a `gigmatch-backend/` directory with chart templates.
- Edit `values.yaml` to set your image repository, tag, environment variables, and service ports.

Example `values.yaml` snippet:
```yaml
image:
  repository: <your-docker-username>/gigmatch-backend
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 5000

env:
  MONGO_URI: "mongodb://mongo:27017/gigmatch"
```

---

## 5. (Optional) Add MongoDB as a Dependency
- Use the Bitnami MongoDB Helm chart:
```sh
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install mongo bitnami/mongodb --set auth.enabled=false
```
- Update your backend's `MONGO_URI` to point to the MongoDB service (e.g., `mongodb://mongo:27017/gigmatch`).

---

## 6. Deploy Your Backend with Helm
```sh
helm install gigmatch-backend ./gigmatch-backend
```
- To upgrade after changes:
```sh
helm upgrade gigmatch-backend ./gigmatch-backend
```

---

## 7. Install ArgoCD on Minikube
```sh
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

---

## 8. Expose ArgoCD UI (for local access)
```sh
kubectl port-forward svc/argocd-server -n argocd 8080:443
```
- Access at: https://localhost:8080
- Get initial admin password:
```sh
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

---

## 9. Set Up GitOps with ArgoCD
- Push your Helm chart and Kubernetes manifests to a Git repository.
- In ArgoCD UI, create a new Application:
  - **Repository URL**: Your Git repo
  - **Path**: Path to your Helm chart (e.g., `gigmatch-backend`)
  - **Cluster**: https://kubernetes.default.svc
  - **Namespace**: default (or your chosen namespace)
- ArgoCD will sync and deploy your app automatically from Git.

---

## 10. (Optional) Deploy Frontend
- Repeat the Helm chart creation and deployment steps for your frontend (React app served via nginx or similar).

---

## 11. Monitor and Manage
- Use `kubectl get pods,svc` to check status.
- Use ArgoCD UI for GitOps management and rollbacks.

---

## Deploying Both Frontend and Backend with Helm (Full MERN Stack)

To deploy your entire MERN application (frontend and backend) on Kubernetes using Helm, follow these steps:

### 1. Create Helm Charts for Both Services

#### Backend
- Already created as `gigmatch-backend`.

#### Frontend
```sh
helm create gigmatch-frontend
```
- Edit `gigmatch-frontend/values.yaml` to set your React/nginx image, ports, and any environment variables.

Example `values.yaml` for frontend:
```yaml
image:
  repository: <your-docker-username>/gigmatch-frontend
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
```

---

### 2. Create an Umbrella Chart

At the root of your Helm charts directory:
```sh
helm create gigmatch
```
- This creates a new chart named `gigmatch`.
- Remove the default templates in `gigmatch/templates/` (keep the directory empty for now).

In `gigmatch/Chart.yaml`, add both charts as dependencies:
```yaml
apiVersion: v2
name: gigmatch
version: 0.1.0
dependencies:
  - name: gigmatch-backend
    version: 0.1.0
    repository: file://../gigmatch-backend
  - name: gigmatch-frontend
    version: 0.1.0
    repository: file://../gigmatch-frontend
```

In `gigmatch/values.yaml`, you can override values for both subcharts:
```yaml
gigmatch-backend:
  image:
    tag: latest
  env:
    MONGO_URI: "mongodb://mongo:27017/gigmatch"

gigmatch-frontend:
  image:
    tag: latest
```

---

### 3. (Optional) Add MongoDB as a Dependency

You can add the Bitnami MongoDB chart as a dependency in your umbrella chart's Chart.yaml:
```yaml
dependencies:
  - name: mongodb
    version: 13.6.4
    repository: https://charts.bitnami.com/bitnami
```
And configure it in values.yaml.

---

### 4. Install the Whole Stack

From the umbrella chart directory:
```sh
helm dependency update
helm install gigmatch .
```

---

### 5. Update ArgoCD Application YAML

In your ArgoCD Application YAML, set the path to your umbrella chart (e.g., `gigmatch`).

Example:
```yaml
spec:
  source:
    repoURL: 'https://github.com/your-username/your-repo.git'
    targetRevision: HEAD
    path: gigmatch  # <-- Path to your umbrella chart
    helm:
      valueFiles:
        - values.yaml
```

---

Now, you can deploy and manage your entire MERN stack (frontend, backend, and database) on Kubernetes with a single Helm release and ArgoCD Application!

---

## References
- [Helm Docs](https://helm.sh/docs/)
- [ArgoCD Docs](https://argo-cd.readthedocs.io/)
- [Minikube Docs](https://minikube.sigs.k8s.io/) 