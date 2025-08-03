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