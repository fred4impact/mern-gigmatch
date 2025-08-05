#!/bin/bash

echo "🔧 Fixing Minikube Setup for ArgoCD and gigmatch..."

# 1. Fix metrics server for Minikube
echo "📊 Fixing metrics server..."
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

# 2. Wait for metrics server to be ready
echo "⏳ Waiting for metrics server to be ready..."
kubectl wait --for=condition=ready pod -l k8s-app=metrics-server -n kube-system --timeout=300s

# 3. Check HPA status
echo "📈 Checking HPA status..."
kubectl get hpa -n gigmatch

# 4. Check ingress status
echo "🌐 Checking ingress status..."
kubectl get ingress -n gigmatch

# 5. Show access information
echo ""
echo "✅ Setup Complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: kubectl port-forward -n gigmatch svc/gigmatch-frontend 3000:80"
echo "   Then visit: http://localhost:3000"
echo ""
echo "🔧 Access ArgoCD:"
echo "   kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "   Then visit: https://localhost:8080"
echo "   Username: admin"
echo "   Password: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
echo ""
echo "📊 Check application status:"
echo "   kubectl get pods -n gigmatch"
echo "   argocd app get gigmatch" 