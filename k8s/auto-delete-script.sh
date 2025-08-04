#!/bin/bash
set -e

# Configuration
NAMESPACE="gigmatch"
ENVIRONMENT="${1:-development}"

echo "🗑️  Auto-Delete Script for Kubernetes Resources"
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo "⚠️  WARNING: This will delete ALL resources in namespace: $NAMESPACE"

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

# Function to confirm deletion
confirm_deletion() {
    echo ""
    echo "🔍 Current resources in namespace $NAMESPACE:"
    kubectl get all -n $NAMESPACE 2>/dev/null || echo "No resources found"
    echo ""
    
    read -p "Are you sure you want to delete ALL resources in namespace '$NAMESPACE'? (yes/no): " confirm
    if [[ $confirm != "yes" ]]; then
        echo "❌ Deletion cancelled by user"
        exit 0
    fi
}

# Function to delete resources with error handling
delete_resource() {
    local resource_type=$1
    local resource_name=$2
    local description=$3
    
    echo "Deleting $description..."
    if kubectl delete $resource_type $resource_name -n $NAMESPACE --ignore-not-found=true; then
        echo "✅ $description deleted successfully"
    else
        echo "⚠️  $description not found or already deleted"
    fi
}

# Function to wait for resource deletion
wait_for_deletion() {
    local resource_type=$1
    local resource_name=$2
    local timeout=${3:-60}
    
    echo "Waiting for $resource_name to be deleted..."
    if kubectl wait --for=delete $resource_type/$resource_name -n $NAMESPACE --timeout=${timeout}s 2>/dev/null; then
        echo "✅ $resource_name deleted successfully"
    else
        echo "⚠️  $resource_name deletion timeout or already deleted"
    fi
}

# Function to delete all resources of a specific type
delete_all_resources() {
    local resource_type=$1
    local description=$2
    
    echo "Deleting all $description..."
    if kubectl delete $resource_type --all -n $NAMESPACE --ignore-not-found=true; then
        echo "✅ All $description deleted successfully"
    else
        echo "⚠️  No $description found or already deleted"
    fi
}

# Function to check if namespace is empty
check_namespace_empty() {
    echo "Checking if namespace is empty..."
    local remaining_resources=$(kubectl get all -n $NAMESPACE 2>/dev/null | wc -l)
    if [[ $remaining_resources -le 1 ]]; then
        echo "✅ Namespace $NAMESPACE is empty"
        return 0
    else
        echo "⚠️  Some resources still remain in namespace $NAMESPACE"
        kubectl get all -n $NAMESPACE
        return 1
    fi
}

# Main deletion process
echo "🚀 Starting deletion process..."

# Check if namespace exists
if ! check_namespace; then
    echo "❌ Cannot proceed - namespace does not exist"
    exit 1
fi

# Confirm deletion
confirm_deletion

echo ""
echo "🗑️  Starting resource deletion..."

# Delete Horizontal Pod Autoscalers first (they depend on deployments)
echo "📊 Step 1: Deleting Horizontal Pod Autoscalers..."
delete_all_resources "hpa" "Horizontal Pod Autoscalers"

# Delete Ingress and Network Policies
echo "🌐 Step 2: Deleting Ingress and Network Policies..."
delete_all_resources "ingress" "Ingress resources"
delete_all_resources "networkpolicy" "Network Policies"

# Delete Deployments (this will also delete associated pods)
echo "⚙️  Step 3: Deleting Deployments..."
delete_all_resources "deployment" "Deployments"

# Wait for pods to be terminated
echo "⏳ Step 4: Waiting for pods to terminate..."
sleep 10

# Delete Services
echo "🔌 Step 5: Deleting Services..."
delete_all_resources "service" "Services"

# Delete ConfigMaps and Secrets
echo "🔧 Step 6: Deleting ConfigMaps and Secrets..."
delete_all_resources "configmap" "ConfigMaps"
delete_all_resources "secret" "Secrets"

# Delete Persistent Volume Claims (if any)
echo "💾 Step 7: Deleting Persistent Volume Claims..."
delete_all_resources "pvc" "Persistent Volume Claims"

# Delete any remaining resources
echo "🧹 Step 8: Cleaning up any remaining resources..."
delete_all_resources "pod" "Pods"
delete_all_resources "replicaset" "ReplicaSets"

# Wait a bit for all resources to be cleaned up
echo "⏳ Step 9: Final cleanup wait..."
sleep 15

# Check if namespace is empty
if check_namespace_empty; then
    echo ""
    echo "🎉 All resources successfully deleted from namespace $NAMESPACE!"
    echo ""
    echo "💡 Optional: If you want to delete the namespace itself, run:"
    echo "   kubectl delete namespace $NAMESPACE"
else
    echo ""
    echo "⚠️  Some resources may still remain. You can force delete them with:"
    echo "   kubectl delete all --all -n $NAMESPACE --force --grace-period=0"
fi

echo ""
echo "✅ Auto-delete process completed!" 