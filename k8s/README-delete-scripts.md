# Kubernetes Auto-Delete Scripts for GigMatch

This directory contains scripts for safely deleting all Kubernetes resources within the `gigmatch` namespace for practice and development purposes.

## Scripts Overview

### 1. `auto-delete-script.sh` - Safe Delete with Confirmation
- **Purpose**: Safely delete all resources with user confirmation
- **Features**: 
  - Shows current resources before deletion
  - Requires explicit "yes" confirmation
  - Deletes resources in proper dependency order
  - Provides detailed progress feedback
  - Error handling and status checks

### 2. `quick-delete-script.sh` - Fast Delete without Confirmation
- **Purpose**: Quick deletion for practice sessions
- **Features**:
  - No confirmation required
  - Faster execution
  - Same proper deletion order
  - Minimal output for quick operations

## Usage

### Making Scripts Executable
```bash
chmod +x auto-delete-script.sh
chmod +x quick-delete-script.sh
```

### Running the Safe Delete Script
```bash
# Basic usage
./auto-delete-script.sh

# With environment parameter
./auto-delete-script.sh development
./auto-delete-script.sh staging
```

### Running the Quick Delete Script
```bash
# Basic usage
./quick-delete-script.sh

# With environment parameter
./quick-delete-script.sh development
```

## What Gets Deleted

The scripts delete resources in the following order to avoid dependency issues:

1. **Horizontal Pod Autoscalers (HPA)** - Depend on deployments
2. **Ingress & Network Policies** - Network layer resources
3. **Deployments** - Application workloads (also deletes associated pods)
4. **Services** - Network services
5. **ConfigMaps & Secrets** - Configuration data
6. **Persistent Volume Claims (PVC)** - Storage resources
7. **Pods & ReplicaSets** - Any remaining resources

## Safety Features

### Auto-Delete Script
- ✅ Namespace existence check
- ✅ Resource preview before deletion
- ✅ User confirmation required
- ✅ Proper error handling
- ✅ Graceful failure handling
- ✅ Final status verification

### Quick-Delete Script
- ✅ Namespace existence check
- ✅ Proper deletion order
- ✅ Error suppression for missing resources
- ✅ Final status check

## Practice Workflow

### Typical Practice Session
```bash
# 1. Deploy your application
./auto-dp-script.sh

# 2. Practice with kubectl commands
kubectl get all -n gigmatch
kubectl logs -l app=backend -n gigmatch
kubectl exec -it <pod-name> -n gigmatch -- /bin/bash

# 3. Clean up when done
./auto-delete-script.sh
```

### Quick Iteration
```bash
# 1. Deploy
./auto-dp-script.sh

# 2. Make changes and redeploy
kubectl apply -f your-changed-file.yaml

# 3. Quick cleanup
./quick-delete-script.sh

# 4. Repeat
```

## Manual kubectl Commands for Reference

### Check Current Resources
```bash
kubectl get all -n gigmatch
kubectl get pods -n gigmatch
kubectl get services -n gigmatch
kubectl get deployments -n gigmatch
```

### Manual Deletion Commands
```bash
# Delete specific resource types
kubectl delete deployment --all -n gigmatch
kubectl delete service --all -n gigmatch
kubectl delete configmap --all -n gigmatch

# Delete everything at once (use with caution)
kubectl delete all --all -n gigmatch

# Delete namespace (removes everything)
kubectl delete namespace gigmatch
```

## Troubleshooting

### If Resources Don't Delete
```bash
# Force delete with no grace period
kubectl delete all --all -n gigmatch --force --grace-period=0

# Check for finalizers
kubectl get namespace gigmatch -o yaml
```

### If Script Fails
```bash
# Check namespace exists
kubectl get namespace gigmatch

# Check current resources
kubectl get all -n gigmatch

# Manual cleanup
kubectl delete all --all -n gigmatch --ignore-not-found=true
```

## Best Practices

1. **Always use the safe script first** - Get familiar with what gets deleted
2. **Use quick script for repeated practice** - Once you're comfortable
3. **Check resources before deletion** - Know what you're removing
4. **Keep namespace for reuse** - Don't delete the namespace unless necessary
5. **Use proper deletion order** - Avoid dependency issues

## Environment Variables

Both scripts support environment parameters:
- `development` (default)
- `staging`
- `production`

Example:
```bash
./auto-delete-script.sh production
```

## Notes

- The namespace itself is not deleted by default
- Scripts use `--ignore-not-found=true` to handle missing resources gracefully
- All operations are scoped to the `gigmatch` namespace
- Scripts are designed for practice and development environments
- Use with caution in production environments 