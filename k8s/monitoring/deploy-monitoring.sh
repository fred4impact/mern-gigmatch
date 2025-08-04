#!/bin/bash
set -e

echo "🚀 Deploying Monitoring Stack for GigMatch..."

# Create monitoring namespace
echo "📁 Creating monitoring namespace..."
kubectl apply -f namespace.yaml

# Deploy Prometheus
echo "📊 Deploying Prometheus..."
kubectl apply -f prometheus-config.yaml
kubectl apply -f prometheus-deployment.yaml

# Deploy Node Exporter
echo "🖥️  Deploying Node Exporter..."
kubectl apply -f node-exporter.yaml

# Deploy MongoDB Exporter
echo "🗄️  Deploying MongoDB Exporter..."
kubectl apply -f mongodb-exporter.yaml

# Deploy Grafana
echo "📈 Deploying Grafana..."
kubectl apply -f grafana-deployment.yaml

# Deploy Ingress
echo "🌐 Deploying Monitoring Ingress..."
kubectl apply -f monitoring-ingress.yaml

# Wait for deployments to be ready
echo "⏳ Waiting for monitoring components to be ready..."

echo "Waiting for Prometheus..."
kubectl wait --for=condition=available deployment/prometheus -n monitoring --timeout=300s

echo "Waiting for Grafana..."
kubectl wait --for=condition=available deployment/grafana -n monitoring --timeout=300s

echo "Waiting for MongoDB Exporter..."
kubectl wait --for=condition=available deployment/mongodb-exporter -n monitoring --timeout=300s

# Health check
echo "🔍 Performing health check..."
sleep 30

echo "📊 Monitoring Stack Status:"
kubectl get pods -n monitoring

echo ""
echo "🎉 Monitoring stack deployed successfully!"
echo ""
echo "📱 Access your monitoring tools:"
echo "   Grafana: http://grafana.gigmatch.local (admin/admin123)"
echo "   Prometheus: http://prometheus.gigmatch.local"
echo ""
echo "💡 Next steps:"
echo "   1. Add your /etc/hosts entries:"
echo "      127.0.0.1 grafana.gigmatch.local"
echo "      127.0.0.1 prometheus.gigmatch.local"
echo "   2. Import dashboards in Grafana"
echo "   3. Configure alerts (optional)" 