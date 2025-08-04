# ArgoCD Git Authentication Fix Guide

## 🔍 Problem: Repository Authentication Error

**Error Message:**
```
ComparisonError
Failed to load target state: failed to generate manifest for source 1 of 1: rpc error: code = Unknown desc = failed to list refs: authentication required: Repository not found.
```

**Root Cause:** ArgoCD cannot access your private GitHub repository due to missing authentication credentials.

---

## 🛠️ Solutions

### Option 1: Make Repository Public (Quick Fix)

**Steps:**
1. Go to your GitHub repository: `https://github.com/fred4impact/mern-gigmatch`
2. Click **Settings** tab
3. Scroll down to **"Danger Zone"**
4. Click **"Change repository visibility"**
5. Select **"Make public"**
6. Type repository name to confirm
7. Click **"I understand, change repository visibility"**

**Pros:** Quick and easy
**Cons:** Repository becomes publicly accessible

**Apply ArgoCD after making public:**
```bash
kubectl apply -f argocd-app.yaml
```

---

### Option 2: SSH Authentication (Recommended for Private Repos)

#### Step 1: Generate SSH Key Pair
```bash
# Generate SSH key pair for ArgoCD
ssh-keygen -t rsa -b 4096 -f ~/.ssh/argocd_rsa -N ""

# Display public key to copy
cat ~/.ssh/argocd_rsa.pub
```

#### Step 2: Add SSH Key to GitHub Repository
1. Go to your GitHub repository: `https://github.com/fred4impact/mern-gigmatch`
2. Click **Settings** tab
3. Click **"Deploy keys"** in the left sidebar
4. Click **"Add deploy key"**
5. Fill in the form:
   - **Title:** `ArgoCD Deploy Key`
   - **Key:** Paste the public key from Step 1
   - **Allow write access:** Check if you need ArgoCD to push changes
6. Click **"Add key"**

#### Step 3: Create Kubernetes Secret for SSH Key
```bash
# Create secret with SSH private key
kubectl create secret generic argocd-repo-credentials \
  --from-file=sshPrivateKey=~/.ssh/argocd_rsa \
  --namespace=argocd
```

#### Step 4: Update ArgoCD Application for SSH
```yaml
# argocd-app.yaml
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
    repoURL: 'git@github.com:fred4impact/mern-gigmatch.git'  # SSH URL
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

#### Step 5: Apply Updated Configuration
```bash
kubectl apply -f argocd-app.yaml
```

---

### Option 3: Personal Access Token Authentication

#### Step 1: Create GitHub Personal Access Token
1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Fill in the form:
   - **Note:** `ArgoCD Access Token`
   - **Expiration:** Choose appropriate expiration
   - **Scopes:** Select `repo` (Full control of private repositories)
4. Click **"Generate token"**
5. **Copy the token** (you won't see it again!)

#### Step 2: Create Kubernetes Secret for Token
```bash
# Replace with your actual GitHub username and token
kubectl create secret generic argocd-repo-credentials \
  --from-literal=username=your-github-username \
  --from-literal=password=your-github-token \
  --namespace=argocd
```

#### Step 3: Keep HTTPS URL in ArgoCD App
```yaml
# argocd-app.yaml (keep HTTPS URL)
source:
  repoURL: 'https://github.com/fred4impact/mern-gigmatch.git'  # HTTPS URL
```

#### Step 4: Apply Configuration
```bash
kubectl apply -f argocd-app.yaml
```

---

## 🔧 Verification Steps

### Check ArgoCD Application Status
```bash
# Check application status
kubectl get applications -n argocd

# Get detailed application info
kubectl describe application gigmatch -n argocd

# Check application logs
kubectl logs -f deployment/argocd-repo-server -n argocd
```

### Test Repository Access
```bash
# Test SSH access (if using SSH)
ssh -T git@github.com

# Test HTTPS access (if using token)
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

### Check ArgoCD Repository Configuration
```bash
# List configured repositories
argocd repo list

# Test repository connection
argocd repo add https://github.com/fred4impact/mern-gigmatch.git --username YOUR_USERNAME --password YOUR_TOKEN
```

---

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. "Repository not found" Error
**Cause:** Repository is private and ArgoCD has no access
**Solution:** Implement one of the authentication methods above

#### 2. SSH Key Permission Denied
**Cause:** SSH key not properly added to GitHub
**Solution:** 
```bash
# Verify SSH key
ssh -T git@github.com

# Re-add deploy key to GitHub repository
```

#### 3. Token Authentication Failed
**Cause:** Invalid or expired token
**Solution:**
```bash
# Regenerate token on GitHub
# Update Kubernetes secret
kubectl delete secret argocd-repo-credentials -n argocd
kubectl create secret generic argocd-repo-credentials \
  --from-literal=username=your-username \
  --from-literal=password=new-token \
  --namespace=argocd
```

#### 4. ArgoCD Repo Server Issues
**Cause:** ArgoCD repo server needs restart after credential changes
**Solution:**
```bash
# Restart ArgoCD repo server
kubectl rollout restart deployment/argocd-repo-server -n argocd

# Check pod status
kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-repo-server
```

---

## 📋 Complete Fix Checklist

### For SSH Authentication:
- [ ] Generate SSH key pair
- [ ] Add public key to GitHub repository deploy keys
- [ ] Create Kubernetes secret with private key
- [ ] Update ArgoCD app to use SSH URL
- [ ] Apply ArgoCD application
- [ ] Verify application status

### For Token Authentication:
- [ ] Create GitHub personal access token
- [ ] Create Kubernetes secret with token
- [ ] Keep HTTPS URL in ArgoCD app
- [ ] Apply ArgoCD application
- [ ] Verify application status

### For Public Repository:
- [ ] Make repository public on GitHub
- [ ] Apply ArgoCD application
- [ ] Verify application status

---

## 🔄 Quick Commands Reference

### SSH Method:
```bash
# Generate key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/argocd_rsa -N ""
cat ~/.ssh/argocd_rsa.pub

# Create secret
kubectl create secret generic argocd-repo-credentials \
  --from-file=sshPrivateKey=~/.ssh/argocd_rsa \
  --namespace=argocd

# Apply app
kubectl apply -f argocd-app.yaml
```

### Token Method:
```bash
# Create secret
kubectl create secret generic argocd-repo-credentials \
  --from-literal=username=your-username \
  --from-literal=password=your-token \
  --namespace=argocd

# Apply app
kubectl apply -f argocd-app.yaml
```

### Public Repository:
```bash
# Just apply (after making repo public)
kubectl apply -f argocd-app.yaml
```

---

## 🎯 Best Practices

1. **Use SSH for Production:** More secure and doesn't expire
2. **Use Tokens for CI/CD:** Easier to rotate and manage
3. **Make Repos Public for Development:** Faster setup and testing
4. **Rotate Credentials Regularly:** Especially for tokens
5. **Monitor ArgoCD Logs:** Check for authentication issues
6. **Use Repository-Specific Deploy Keys:** Instead of personal SSH keys

---

## 📚 Additional Resources

- [ArgoCD Repository Management](https://argo-cd.readthedocs.io/en/stable/user-guide/private-repositories/)
- [GitHub Deploy Keys](https://docs.github.com/en/developers/overview/managing-deploy-keys)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)

---

**Remember:** Choose the authentication method that best fits your security requirements and workflow! 