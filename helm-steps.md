# Deploying Full MERN Stack (Backend + Frontend) with Helm & ArgoCD

## 1. Prerequisites
- Kubernetes cluster (Minikube, GKE, EKS, etc.)
- `kubectl`, `helm`, and ArgoCD CLI installed
- Docker images for backend and frontend pushed to Docker Hub

## 2. Create Helm Charts
- **Backend:**  
  ```sh
  helm create gigmatch-backend
  ```
  - Edit `gigmatch-backend/values.yaml`:
    ```yaml
    image:
      repository: <your-dockerhub-username>/gigmatch-backend
      tag: latest
      pullPolicy: IfNotPresent
    service:
      type: ClusterIP
      port: 5000
    env:
      MONGO_URI: "mongodb://mongo:27017/gigmatch"
    ```

- **Frontend:**  
  ```sh
  helm create gigmatch-frontend
  ```
  - Edit `gigmatch-frontend/values.yaml`:
    ```yaml
    image:
      repository: <your-dockerhub-username>/gigmatch-frontend
      tag: latest
      pullPolicy: IfNotPresent
    service:
      type: ClusterIP
      port: 80
    ```

- **MongoDB:**  
  Use Bitnami chart:
  ```sh
  helm repo add bitnami https://charts.bitnami.com/bitnami
  helm repo update
  helm install mongo bitnami/mongodb --set auth.enabled=false
  ```

## 3. Create an Umbrella Chart (Recommended)
- At the root of your Helm charts directory:
  ```sh
  helm create gigmatch
  ```
- Remove default templates in `gigmatch/templates/`.
- In `gigmatch/Chart.yaml`, add dependencies:
  ```yaml
  dependencies:
    - name: gigmatch-backend
      version: 0.1.0
      repository: file://../gigmatch-backend
    - name: gigmatch-frontend
      version: 0.1.0
      repository: file://../gigmatch-frontend
    - name: mongodb
      version: 13.6.4
      repository: https://charts.bitnami.com/bitnami
  ```
- In `gigmatch/values.yaml`, override values as needed:
  ```yaml
  gigmatch-backend:
    image:
      tag: latest
    env:
      MONGO_URI: "mongodb://mongo:27017/gigmatch"
  gigmatch-frontend:
    image:
      tag: latest
  mongodb:
    auth:
      enabled: false
  ```

## 4. Install the Stack with Helm
- From the umbrella chart directory:
  ```sh
  helm dependency update
  helm install gigmatch .
  ```

## 5. Install ArgoCD
- (If not already installed)
  ```sh
  kubectl create namespace argocd
  kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
  ```

## 6. Expose ArgoCD UI
  ```sh
  kubectl port-forward svc/argocd-server -n argocd 8080:443
  ```
  - Access at: https://localhost:8080
  - Get initial admin password:
    ```sh
    kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
    ```

## 7. Push Helm Charts to Git
- Commit and push your `gigmatch`, `gigmatch-backend`, and `gigmatch-frontend` charts to your Git repo.

## 8. Create ArgoCD Application
- Example `argocd-app.yaml`:
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
      path: gigmatch
    destination:
      server: 'https://kubernetes.default.svc'
      namespace: default
    syncPolicy:
      automated:
        prune: true
        selfHeal: true
  ```
- Apply with:
  ```sh
  kubectl apply -f argocd-app.yaml
  ```

## 9. Monitor and Manage
- Use `kubectl get pods,svc` to check status.
- Use ArgoCD UI for GitOps management and rollbacks.

---

**Tips:**
- Adjust image names, tags, and environment variables as needed.
- For production, secure MongoDB and use secrets for sensitive env vars.
- Use Ingress for external access if needed. 

---

# Practical Helm & kubectl Commands for Accessing Your MERN Stack

## 1. Check Status of Pods and Services
```sh
kubectl get pods
kubectl get svc
```

## 2. Port-Forward to Access Services Locally

### Frontend (React/nginx)
```sh
kubectl port-forward svc/gigmatch-gigmatch-frontend 8081:80
```
- Access in browser: http://localhost:8080

### Backend (API)
```sh
kubectl port-forward svc/gigmatch-gigmatch-backend 5001:5001
```
- Access API: http://localhost:5000

### MongoDB (for Compass or mongosh)
```sh
kubectl port-forward svc/gigmatch-mongodb 27017:27017
```
- Then connect using Compass or mongosh:
  - Connection string: mongodb://localhost:27017
  - Example: `mongosh --host 127.0.0.1`

## 3. Upgrade Your Helm Release (after changing values or chart)
```sh
helm upgrade gigmatch .
```

## 4. Uninstall Your Helm Release (delete all resources)
```sh
helm uninstall gigmatch
```

## 5. List All Helm Releases
```sh
helm list --all-namespaces
```

## 6. (Optional) Change Service Type to NodePort
- Edit your chart's `values.yaml`:
  ```yaml
  service:
    type: NodePort
    port: 80   # or 5000 for backend
  ```
- Then upgrade:
  ```sh
  helm upgrade gigmatch .
  ```
- Check the assigned NodePort:
  ```sh
  kubectl get svc
  ```

---

**Tip:** For production, consider setting up an Ingress controller for secure, user-friendly URLs and TLS support. 

---

# Managing Helm Chart Repositories

## 1. List All Helm Repositories
```sh
helm repo list
```

## 2. Remove an Old/Unused Helm Repository
```sh
helm repo remove <repo-name>
```
- Example:
  ```sh
  helm repo remove django-ledger
  ```

## 3. Update All Helm Repositories
```sh
helm repo update
```

## 4. Add a New Helm Repository (if needed)
```sh
helm repo add <name> <url>
```
- Example:
  ```sh
  helm repo add bitnami https://charts.bitnami.com/bitnami
  ```

---

**Tip:** Removing unused or broken repositories helps keep your Helm environment clean and avoids errors during `helm dependency update`. 