# Kubernetes Deployment Checks for GigMatch

This guide provides comprehensive commands to check and verify that your frontend and backend services are running properly in Kubernetes.

## **1. Check Overall Deployment Status**

```bash
# Check all resources in the gigmatch namespace
kubectl get all -n gigmatch

# Check specific deployments
kubectl get deployments -n gigmatch

# Check pods status
kubectl get pods -n gigmatch

# Check services
kubectl get services -n gigmatch

# Check ingress
kubectl get ingress -n gigmatch
```

## **2. Check Pod Status and Health**

```bash
# Check detailed pod information
kubectl describe pods -n gigmatch

# Check specific backend pods
kubectl get pods -l app=gigmatch-backend -n gigmatch

# Check specific frontend pods
kubectl get pods -l app=gigmatch-frontend -n gigmatch

# Check MongoDB pods
kubectl get pods -l app=mongodb -n gigmatch
```

## **3. Check Service Connectivity**

```bash
# Check service endpoints
kubectl get endpoints -n gigmatch

# Check backend service details
kubectl describe service gigmatch-backend -n gigmatch

# Check frontend service details
kubectl describe service gigmatch-frontend -n gigmatch
```

## **4. Check Application Logs**

```bash
# Check backend logs
kubectl logs -f deployment/gigmatch-backend -n gigmatch

# Check frontend logs
kubectl logs -f deployment/gigmatch-frontend -n gigmatch

# Check MongoDB logs
kubectl logs -f deployment/mongodb -n gigmatch

# Check logs from specific pods (if you have multiple replicas)
kubectl logs -f <pod-name> -n gigmatch
```

## **5. Test Application Access**

```bash
# Port forward to test backend API
kubectl port-forward svc/gigmatch-backend -n gigmatch 5000:5000

# Port forward to test frontend
kubectl port-forward svc/gigmatch-frontend -n gigmatch 3000:80

# Test backend health endpoint
curl http://localhost:5000/api/health

# Test frontend
curl http://localhost:3000
```

## **6. Check Resource Usage**

```bash
# Check resource usage of pods
kubectl top pods -n gigmatch

# Check resource usage of nodes
kubectl top nodes

# Check resource limits and requests
kubectl describe pods -n gigmatch | grep -A 5 -B 5 "Limits:"
```

## **7. Check Events and Issues**

```bash
# Check events in the namespace
kubectl get events -n gigmatch --sort-by='.lastTimestamp'

# Check events for specific resources
kubectl describe deployment gigmatch-backend -n gigmatch
kubectl describe deployment gigmatch-frontend -n gigmatch
```

## **8. Verify Ingress Configuration**

```bash
# Check ingress status
kubectl describe ingress gigmatch-ingress -n gigmatch

# Check if ingress controller is working
kubectl get pods -n ingress-nginx

# Test ingress routing
curl -H "Host: gigmatch.local" http://localhost
```

## **9. Quick Health Check Script**

Create a simple script to check everything at once:

```bash
#!/bin/bash
echo "=== GigMatch Kubernetes Health Check ==="
echo

echo "1. Checking namespace..."
kubectl get namespace gigmatch

echo
echo "2. Checking all resources..."
kubectl get all -n gigmatch

echo
echo "3. Checking pod status..."
kubectl get pods -n gigmatch

echo
echo "4. Checking services..."
kubectl get services -n gigmatch

echo
echo "5. Checking ingress..."
kubectl get ingress -n gigmatch

echo
echo "6. Recent events..."
kubectl get events -n gigmatch --sort-by='.lastTimestamp' | tail -10
```

## **10. Expected Output**

When everything is running correctly, you should see:

```bash
# Pods should show "Running" status
NAME                                READY   STATUS    RESTARTS   AGE
gigmatch-backend-6d4cf56db-abc12    1/1     Running   0          5m
gigmatch-backend-6d4cf56db-def34    1/1     Running   0          5m
gigmatch-frontend-8f9e7d6c-ghi56    1/1     Running   0          5m
gigmatch-frontend-8f9e7d6c-jkl78    1/1     Running   0          5m
mongodb-9abc1234-mno90              1/1     Running   0          5m

# Services should show ClusterIP and ports
NAME                TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
gigmatch-backend    ClusterIP   10.96.123.45     <none>        5000/TCP   5m
gigmatch-frontend   ClusterIP   10.96.123.46     <none>        80/TCP     5m
mongodb             ClusterIP   10.96.123.47     <none>        27017/TCP  5m
```

## **11. Troubleshooting Commands**

If you encounter issues:

```bash
# Check if images are pulling correctly
kubectl describe pod <pod-name> -n gigmatch | grep -A 10 -B 5 "Events:"

# Check if secrets are properly mounted
kubectl exec -it <pod-name> -n gigmatch -- env | grep MONGODB_URI

# Check if services can communicate
kubectl exec -it <backend-pod-name> -n gigmatch -- curl mongodb:27017

# Check ingress controller logs
kubectl logs -f deployment/ingress-nginx-controller -n ingress-nginx
```

## **12. ArgoCD Specific Commands**


If using ArgoCD for deployment:

```bash
# Check ArgoCD application status
kubectl get applications -n argocd
kubectl describe application gigmatch -n argocd

# Check ArgoCD sync status
argocd app get gigmatch
argocd app sync gigmatch

# Check ArgoCD logs
argocd app logs gigmatch
```

## **13. Network Policy Verification**

```bash
# Check network policies
kubectl get networkpolicies -n gigmatch

# Check network policy details
kubectl describe networkpolicy gigmatch-network-policy -n gigmatch
```

## **14. Horizontal Pod Autoscaler Check**

```bash
# Check HPA status
kubectl get hpa -n gigmatch

# Check HPA details
kubectl describe hpa gigmatch-backend-hpa -n gigmatch
```

## **15. Persistent Volume Check**

```bash
# Check PVCs
kubectl get pvc -n gigmatch

# Check PVs
kubectl get pv

# Check PVC details
kubectl describe pvc mongodb-pvc -n gigmatch
```

## **16. Security Context Verification**

```bash
# Check if pods are running as non-root
kubectl get pods -n gigmatch -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.securityContext.runAsUser}{"\n"}{end}'

# Check security contexts
kubectl describe pod <pod-name> -n gigmatch | grep -A 10 -B 5 "Security Context:"
```

## **17. Environment Variables Check**

```bash
# Check environment variables in backend pods
kubectl exec -it <backend-pod-name> -n gigmatch -- printenv | grep -E "(MONGODB_URI|JWT_SECRET|NODE_ENV)"

# Check environment variables in frontend pods
kubectl exec -it <frontend-pod-name> -n gigmatch -- printenv
```

## **18. Health Check Endpoints**

```bash
# Test backend health endpoint
kubectl port-forward svc/gigmatch-backend -n gigmatch 5000:5000 &
curl http://localhost:5000/api/health

# Test frontend health
kubectl port-forward svc/gigmatch-frontend -n gigmatch 3000:80 &
curl http://localhost:3000

# Kill port-forward processes
pkill -f "kubectl port-forward"
```

## **19. Load Testing Commands**

```bash
# Simple load test for backend
for i in {1..10}; do curl http://localhost:5000/api/health; done

# Check if load balancing is working
kubectl get endpoints gigmatch-backend -n gigmatch
```

## **20. Complete Health Check Script**

```bash
#!/bin/bash
set -e

NAMESPACE="gigmatch"
echo "=== Comprehensive GigMatch Health Check ==="
echo "Namespace: $NAMESPACE"
echo "Timestamp: $(date)"
echo

# Check namespace exists
echo "1. Checking namespace..."
if kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
    echo "✅ Namespace $NAMESPACE exists"
else
    echo "❌ Namespace $NAMESPACE not found"
    exit 1
fi

# Check all resources
echo
echo "2. Checking all resources..."
kubectl get all -n $NAMESPACE

# Check pod status
echo
echo "3. Checking pod status..."
PODS=$(kubectl get pods -n $NAMESPACE --no-headers | awk '{print $1}')
for pod in $PODS; do
    STATUS=$(kubectl get pod $pod -n $NAMESPACE --no-headers | awk '{print $3}')
    if [ "$STATUS" = "Running" ]; then
        echo "✅ $pod: $STATUS"
    else
        echo "❌ $pod: $STATUS"
    fi
done

# Check services
echo
echo "4. Checking services..."
kubectl get services -n $NAMESPACE

# Check ingress
echo
echo "5. Checking ingress..."
kubectl get ingress -n $NAMESPACE

# Check recent events
echo
echo "6. Recent events..."
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -5

echo
echo "=== Health Check Complete ==="
```

## **Usage Instructions**

1. **Save the health check script** as `health-check.sh`
2. **Make it executable**: `chmod +x health-check.sh`
3. **Run the script**: `./health-check.sh`

## **Common Issues and Solutions**

### **Pods in Pending State**
- Check resource availability: `kubectl describe node`
- Check image pull issues: `kubectl describe pod <pod-name> -n gigmatch`

### **Pods in CrashLoopBackOff**
- Check logs: `kubectl logs <pod-name> -n gigmatch`
- Check environment variables: `kubectl exec -it <pod-name> -n gigmatch -- printenv`

### **Services Not Accessible**
- Check endpoints: `kubectl get endpoints -n gigmatch`
- Check service configuration: `kubectl describe service <service-name> -n gigmatch`

### **Ingress Not Working**
- Check ingress controller: `kubectl get pods -n ingress-nginx`
- Check ingress configuration: `kubectl describe ingress -n gigmatch`

This comprehensive guide will help you verify that your GigMatch application is running correctly in Kubernetes and troubleshoot any issues that may arise. 

```bash
# Restart frontend deployment
kubectl rollout restart deployment/gigmatch-frontend -n gigmatch

# Wait for the rollout to complete
kubectl rollout status deployment/gigmatch-frontend -n gigmatch

# Check if the ConfigMap was updated
kubectl get configmap gigmatch-config -n gigmatch -o yaml

# Check if frontend pods have the new environment variables
kubectl exec -it $(kubectl get pods -l app=gigmatch-frontend -n gigmatch -o jsonpath='{.items[0].metadata.name}') -n gigmatch -- printenv | grep REACT_APP_API_URL



# Check if the ConfigMap was updated
kubectl get configmap gigmatch-config -n gigmatch -o yaml


# Port forward to test the frontend
kubectl port-forward svc/gigmatch-frontend -n gigmatch 3000:80

# In another terminal, test the backend
kubectl port-forward svc/gigmatch-backend -n gigmatch 5000:5000


Alternative Solution: Use Ingress for External Access
If you want to access the application from outside the cluster, you can also configure the frontend to use the ingress URL:
Update ConfigMap for Ingress:

# In k8s/configMap.yaml
data:
  NODE_ENV: development
  FRONTEND_URL: http://gigmatch.local
  PORT: "5000"
  REACT_APP_API_URL: "http://gigmatch.local/api"