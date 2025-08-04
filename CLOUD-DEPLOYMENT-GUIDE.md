# Cloud Deployment Guide for GigMatch

This guide explains how to deploy GigMatch to cloud environments (AWS, GCP, Azure, etc.) with proper CORS configuration and production-ready settings.

## 🎯 Overview

The CORS changes made will work perfectly in cloud environments, but you need to:

1. **Update domain configurations** for your cloud domains
2. **Use production CORS settings** with proper security
3. **Configure SSL/TLS** for HTTPS
4. **Set up proper ingress routing**

## ✅ CORS Configuration for Cloud

### Production CORS Settings
The production server configuration (`backend/server-production.js`) includes:

```javascript
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://gigmatch.yourdomain.com',
      'https://www.gigmatch.yourdomain.com',
      'https://staging.gigmatch.yourdomain.com',
      // Development URLs for testing
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

## 🚀 Cloud Deployment Steps

### 1. Update Domain Configuration

**Replace `yourdomain.com` with your actual domain:**

```bash
# Update these files with your actual domain
sed -i 's/yourdomain.com/YOUR-ACTUAL-DOMAIN.com/g' k8s/configMap-production.yaml
sed -i 's/yourdomain.com/YOUR-ACTUAL-DOMAIN.com/g' k8s/ingress-production.yaml
sed -i 's/yourdomain.com/YOUR-ACTUAL-DOMAIN.com/g' k8s/deploy-production.sh
```

### 2. Deploy to Cloud

```bash
# Make script executable
chmod +x k8s/deploy-production.sh

# Deploy to production
cd k8s
./deploy-production.sh
```

### 3. Configure DNS

Point your domains to your cloud cluster:
- `gigmatch.yourdomain.com` → Frontend
- `api.gigmatch.yourdomain.com` → Backend

## 🌐 Environment-Specific Configurations

### AWS EKS
```bash
# Update kubeconfig for EKS
aws eks update-kubeconfig --region us-west-2 --name your-cluster-name

# Deploy
./deploy-production.sh
```

### Google GKE
```bash
# Update kubeconfig for GKE
gcloud container clusters get-credentials your-cluster-name --zone us-central1-a

# Deploy
./deploy-production.sh
```

### Azure AKS
```bash
# Update kubeconfig for AKS
az aks get-credentials --resource-group your-resource-group --name your-cluster-name

# Deploy
./deploy-production.sh
```

## 🔧 Configuration Files

### Production ConfigMap
```yaml
# k8s/configMap-production.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: gigmatch-config
  namespace: gigmatch
data:
  NODE_ENV: production
  FRONTEND_URL: https://gigmatch.yourdomain.com
  PORT: "5000"
  REACT_APP_API_URL: "https://api.gigmatch.yourdomain.com/api"
```

### Production Ingress
```yaml
# k8s/ingress-production.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: gigmatch-ingress
  namespace: gigmatch
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://gigmatch.yourdomain.com"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - gigmatch.yourdomain.com
    - api.gigmatch.yourdomain.com
    secretName: gigmatch-tls
  rules:
  - host: gigmatch.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gigmatch-frontend
            port:
              number: 80
  - host: api.gigmatch.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gigmatch-backend
            port:
              number: 5000
```

## 🔒 Security Considerations

### 1. SSL/TLS Configuration
```bash
# Install cert-manager for automatic SSL certificates
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.11.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@yourdomain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### 2. Network Policies
```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: gigmatch-network-policy
  namespace: gigmatch
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: gigmatch
      ports:
        - protocol: TCP
          port: 5000
        - protocol: TCP
          port: 80
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: gigmatch
      ports:
        - protocol: TCP
          port: 27017
```

## 🧪 Testing Cloud Deployment

### 1. Test CORS Configuration
```bash
# Test from your domain
curl -H "Origin: https://gigmatch.yourdomain.com" \
  https://api.gigmatch.yourdomain.com/api/health

# Test registration endpoint
curl -X POST \
  -H "Origin: https://gigmatch.yourdomain.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  https://api.gigmatch.yourdomain.com/api/auth/register
```

### 2. Browser Testing
1. Open https://gigmatch.yourdomain.com
2. Open browser developer tools (F12)
3. Try to register a user
4. Check Network tab for CORS errors

### 3. SSL Certificate Verification
```bash
# Check SSL certificate
openssl s_client -connect gigmatch.yourdomain.com:443 -servername gigmatch.yourdomain.com

# Check API SSL certificate
openssl s_client -connect api.gigmatch.yourdomain.com:443 -servername api.gigmatch.yourdomain.com
```

## 🔍 Troubleshooting Cloud Deployment

### Common Issues

#### 1. CORS Still Blocked
```bash
# Check ingress annotations
kubectl get ingress gigmatch-ingress -n gigmatch -o yaml

# Check backend logs
kubectl logs -l app=gigmatch-backend -n gigmatch

# Verify ConfigMap
kubectl get configmap gigmatch-config -n gigmatch -o yaml
```

#### 2. SSL Certificate Issues
```bash
# Check certificate status
kubectl get certificates -n gigmatch

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager

# Verify DNS resolution
nslookup gigmatch.yourdomain.com
nslookup api.gigmatch.yourdomain.com
```

#### 3. Ingress Not Working
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress status
kubectl describe ingress gigmatch-ingress -n gigmatch

# Check service endpoints
kubectl get endpoints -n gigmatch
```

### Useful Commands
```bash
# Check all resources
kubectl get all -n gigmatch

# Check ingress and services
kubectl get ingress,svc -n gigmatch

# Check logs
kubectl logs -l app=gigmatch-backend -n gigmatch
kubectl logs -l app=gigmatch-frontend -n gigmatch

# Check events
kubectl get events -n gigmatch --sort-by='.lastTimestamp'
```

## 📊 Monitoring Cloud Deployment

### 1. Set Up Monitoring
```bash
# Deploy monitoring stack
cd helm/monitoring
helm install gigmatch-monitoring . \
  --namespace monitoring \
  --create-namespace \
  --values values-production.yaml
```

### 2. Configure Alerts
```yaml
# Add to your monitoring configuration
alerts:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected"
```

## 🎯 Benefits of Cloud Deployment

✅ **Scalability** - Auto-scaling based on load
✅ **High Availability** - Multi-zone deployment
✅ **Security** - SSL/TLS, network policies
✅ **Monitoring** - Built-in cloud monitoring
✅ **Backup** - Automated backups
✅ **CDN** - Global content delivery

## 📋 Deployment Checklist

- [ ] Update domain names in configuration files
- [ ] Configure DNS to point to cloud cluster
- [ ] Install cert-manager for SSL certificates
- [ ] Deploy with production configuration
- [ ] Test CORS from your domain
- [ ] Verify SSL certificates are issued
- [ ] Test all application functionality
- [ ] Set up monitoring and alerts
- [ ] Configure backup and disaster recovery

## 🆘 Support

If you encounter issues:

1. **Check cloud provider logs** for infrastructure issues
2. **Verify DNS configuration** is correct
3. **Test CORS with curl** to isolate frontend vs backend issues
4. **Check SSL certificate status** in cert-manager
5. **Review ingress controller logs** for routing issues

The CORS configuration will work perfectly in cloud environments with these production-ready settings! 