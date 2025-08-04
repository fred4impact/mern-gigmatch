#!/bin/bash
set -e

# Configuration
NAMESPACE="gigmatch"
ENVIRONMENT="${1:-development}"

echo "⚡ Quick Delete Script for Kubernetes Resources"
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo "🚨 WARNING: This will delete ALL resources in namespace: $NAMESPACE WITHOUT confirmation!"

# Function to check if namespace exists
check_namespace() {
    if kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
        echo "✅ Namespace $NAMESPACE exists"
        return 0
    else
        echo "❌ Namespace $NAMESPACE does not exist"
        return 1
    fi
}

# Function to delete all resources of a specific type
delete_all_resources() {
    local resource_type=$1
    local description=$2
    
    echo "Deleting all $description..."
    kubectl delete $resource_type --all -n $NAMESPACE --ignore-not-found=true
    echo "✅ All $description deleted"
}

# Main deletion process
echo "🚀 Starting quick deletion process..."

# Check if namespace exists
if ! check_namespace; then
    echo "❌ Cannot proceed - namespace does not exist"
    exit 1
fi

echo ""
echo "🗑️  Starting resource deletion..."

# Delete resources in proper order to avoid dependency issues
echo "📊 Step 1: Deleting Horizontal Pod Autoscalers..."
delete_all_resources "hpa" "Horizontal Pod Autoscalers"

echo "🌐 Step 2: Deleting Ingress and Network Policies..."
delete_all_resources "ingress" "Ingress resources"
delete_all_resources "networkpolicy" "Network Policies"

echo "⚙️  Step 3: Deleting Deployments..."
delete_all_resources "deployment" "Deployments"

echo "⏳ Step 4: Waiting for pods to terminate..."
sleep 5

echo "🔌 Step 5: Deleting Services..."
delete_all_resources "service" "Services"

echo "🔧 Step 6: Deleting ConfigMaps and Secrets..."
delete_all_resources "configmap" "ConfigMaps"
delete_all_resources "secret" "Secrets"

echo "💾 Step 7: Deleting Persistent Volume Claims..."
delete_all_resources "pvc" "Persistent Volume Claims"

echo "🧹 Step 8: Final cleanup..."
delete_all_resources "pod" "Pods"
delete_all_resources "replicaset" "ReplicaSets"

echo "⏳ Step 9: Final wait..."
sleep 5

# Final check
echo "🔍 Final status check..."
kubectl get all -n $NAMESPACE 2>/dev/null || echo "✅ Namespace is empty"

echo ""
echo "🎉 Quick delete completed!"
echo "💡 To delete the namespace itself: kubectl delete namespace $NAMESPACE" 