#!/bin/bash

echo "🔍 Deploying GigMatch Monitoring Stack via ArgoCD..."

# 1. Apply the ArgoCD monitoring application
echo "📦 Applying ArgoCD monitoring application..."
kubectl apply -f ../argocd-monitoring-app.yaml

# 2. Wait for the application to be created
echo "⏳ Waiting for ArgoCD application to be created..."
sleep 10

# 3. Check the application status
echo "📊 Checking ArgoCD application status..."
argocd app get gigmatch-monitoring

# 4. Wait for sync to complete
echo "🔄 Waiting for sync to complete..."
argocd app sync gigmatch-monitoring --timeout 300

# 5. Check monitoring resources
echo "🔍 Checking monitoring resources..."
kubectl get all -n monitoring

# 6. Check ingress status
echo "🌐 Checking ingress status..."
kubectl get ingress -n monitoring

# 7. Show access information
echo ""
echo "✅ Monitoring Stack Deployed!"
echo ""
echo "🔍 Access Monitoring Tools:"
echo ""
echo "📊 Grafana:"
echo "   kubectl port-forward -n monitoring svc/gigmatch-monitoring-grafana 3001:3000"
echo "   Then visit: http://localhost:3001"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📈 Prometheus:"
echo "   kubectl port-forward -n monitoring svc/gigmatch-monitoring-prometheus 9090:9090"
echo "   Then visit: http://localhost:9090"
echo ""
echo "📋 Check status:"
echo "   kubectl get pods -n monitoring"
echo "   argocd app get gigmatch-monitoring"
echo ""
echo "🔧 Troubleshooting:"
echo "   kubectl logs -n monitoring -l app=gigmatch-monitoring-prometheus"
echo "   kubectl logs -n monitoring -l app=gigmatch-monitoring-grafana" 