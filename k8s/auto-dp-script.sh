#!/bin/bash
set -e

# Configuration
NAMESPACE="gigmatch"
ENVIRONMENT="${1:-development}"

echo "Deploying Your App to Kubernetes..."
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"

# Function to check if namespace exists
check_namespace() {
    if ! kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
        echo "Creating namespace $NAMESPACE..."
        kubectl create namespace $NAMESPACE
    fi
}

# Function to apply manifests with error handling
apply_manifest() {
    local file=$1
    local description=$2
    
    echo "Applying $description..."
    if kubectl apply -f $file; then
        echo "✅ $description applied successfully"
    else
        echo "❌ Failed to apply $description"
        exit 1
    fi
}

# Function to wait for deployment
wait_for_deployment() {
    local deployment=$1
    local timeout=${2:-300}
    
    echo "Waiting for $deployment to be ready..."
    if kubectl wait --for=condition=available deployment/$deployment -n $NAMESPACE --timeout=${timeout}s; then
        echo "✅ $deployment is ready"
    else
        echo "❌ $deployment failed to become ready"
        kubectl describe deployment $deployment -n $NAMESPACE
        exit 1
    fi
}

# Main deployment process
check_namespace

# Apply configuration
apply_manifest "configMap-$ENVIRONMENT.yaml" "ConfigMap"
apply_manifest "secret-$ENVIRONMENT.yaml" "Secrets"

# Deploy database
apply_manifest "database-deployment.yaml" "Database"
wait_for_deployment "database" 600

# Deploy backend
apply_manifest "backend-deployment.yaml" "Backend"
wait_for_deployment "backend" 300

# Deploy frontend
apply_manifest "frontend-deployment.yaml" "Frontend"
wait_for_deployment "frontend" 300

# Apply networking
apply_manifest "ingress.yaml" "Ingress"
apply_manifest "network-policy.yaml" "Network Policy"
apply_manifest "hpa.yaml" "Horizontal Pod Autoscaler"

# Health check
echo "Performing health check..."
sleep 30
if kubectl get pods -n $NAMESPACE | grep -q "Running"; then
    echo "✅ All pods are running"
else
    echo "❌ Some pods are not running"
    kubectl get pods -n $NAMESPACE
    exit 1
fi

echo "🎉 Deployment complete!"
echo "Access your app at: https://your-app.com"