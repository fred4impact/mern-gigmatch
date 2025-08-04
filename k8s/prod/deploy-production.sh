#!/bin/bash
set -e

echo "🚀 Deploying GigMatch to Production Cloud Environment..."

# Configuration
ENVIRONMENT="production"
DOMAIN="gigmatch.yourdomain.com"
API_DOMAIN="api.gigmatch.yourdomain.com"

echo "Environment: $ENVIRONMENT"
echo "Domain: $DOMAIN"
echo "API Domain: $API_DOMAIN"

# Function to check if namespace exists
check_namespace() {
    if ! kubectl get namespace gigmatch >/dev/null 2>&1; then
        echo "Creating namespace gigmatch..."
        kubectl create namespace gigmatch
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
    if kubectl wait --for=condition=available deployment/$deployment -n gigmatch --timeout=${timeout}s; then
        echo "✅ $deployment is ready"
    else
        echo "❌ $deployment failed to become ready"
        kubectl describe deployment $deployment -n gigmatch
        exit 1
    fi
}

# Main deployment process
check_namespace

# Apply production configuration
echo "📝 Applying production configuration..."
apply_manifest "configMap-production.yaml" "Production ConfigMap"

# Deploy MongoDB
echo "🗄️  Deploying MongoDB..."
apply_manifest "mongodb-deployment.yaml" "MongoDB"
wait_for_deployment "mongodb" 600

# Deploy backend with production settings
echo "⚙️  Deploying Backend..."
apply_manifest "backend-deployment.yaml" "Backend"
wait_for_deployment "gigmatch-backend" 300

# Deploy frontend
echo "🎨 Deploying Frontend..."
apply_manifest "frontend-deployment.yaml" "Frontend"
wait_for_deployment "gigmatch-frontend" 300

# Apply production ingress
echo "🌐 Applying Production Ingress..."
apply_manifest "ingress-production.yaml" "Production Ingress"

# Apply network policies
echo "🔒 Applying Network Policies..."
apply_manifest "network-policy.yaml" "Network Policy"

# Apply HPA
echo "📊 Applying Horizontal Pod Autoscaler..."
apply_manifest "hpa.yaml" "HPA"

# Health check
echo "🔍 Performing health check..."
sleep 30

# Check if all pods are running
if kubectl get pods -n gigmatch | grep -q "Running"; then
    echo "✅ All pods are running"
else
    echo "❌ Some pods are not running"
    kubectl get pods -n gigmatch
    exit 1
fi

# Check ingress status
echo "🌐 Checking ingress status..."
kubectl get ingress -n gigmatch

echo ""
echo "🎉 Production deployment complete!"
echo ""
echo "📱 Access your application:"
echo "   Frontend: https://$DOMAIN"
echo "   API: https://$API_DOMAIN"
echo ""
echo "🔧 Next steps:"
echo "   1. Update your DNS to point to your cluster IP"
echo "   2. Verify SSL certificates are issued"
echo "   3. Test the application endpoints"
echo "   4. Set up monitoring and alerts"
echo ""
echo "📊 Check deployment status:"
echo "   kubectl get all -n gigmatch"
echo "   kubectl get ingress -n gigmatch" 