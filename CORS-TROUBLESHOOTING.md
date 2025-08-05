# CORS Troubleshooting Guide for GigMatch

## 🚨 Problem: Cross-Origin Request Blocked

**Error Message:**
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at http://localhost:5000/api/auth/register. (Reason: CORS request did not succeed). Status code: (null).
```

## 🔍 Root Cause Analysis

The error indicates that:
1. **Port Mismatch**: Frontend expects backend on port 5000, but backend runs on port 5000
2. **CORS Configuration**: Backend CORS settings may not allow the frontend origin
3. **Environment Variables**: Incorrect API URL configuration

## ✅ Solutions Applied

### 1. Fixed Port Configuration
- **Backend**: Running on port 5000 ✅
- **Frontend**: Updated to connect to port 5000 ✅
- **ConfigMap**: Updated `REACT_APP_API_URL` to `http://localhost:5000/api` ✅

### 2. Enhanced CORS Configuration
Updated `backend/server.js` to allow multiple origins:
```javascript
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5000'
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

### 3. Updated Frontend Configuration
- Fixed `authService.js` to use correct port (5000)
- Updated ConfigMap with correct API URL

## 🧪 Testing the Fix

### 1. Test CORS Configuration
```bash
cd backend
node test-cors.js
```

### 2. Manual Testing
```bash
# Test backend health endpoint
curl -H "Origin: http://localhost:3000" http://localhost:5000/api/health

# Test registration endpoint
curl -X POST -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  http://localhost:5000/api/auth/register
```

### 3. Browser Testing
1. Open browser developer tools (F12)
2. Go to Network tab
3. Try to register a user
4. Check if CORS errors are resolved

## 🔧 Additional Troubleshooting Steps

### If CORS Issues Persist:

#### 1. Check Backend Status
```bash
# Verify backend is running
curl http://localhost:5000/api/health

# Check backend logs
kubectl logs -l app=gigmatch-backend -n gigmatch
```

#### 2. Check Frontend Configuration
```bash
# Verify frontend environment variables
echo $REACT_APP_API_URL

# Check if frontend is using correct API URL
# In browser console:
console.log(process.env.REACT_APP_API_URL);
```

#### 3. Verify Network Connectivity
```bash
# Test if frontend can reach backend
curl -v http://localhost:5000/api/health

# Check if ports are open
netstat -an | grep :5000
netstat -an | grep :3000
```

#### 4. Browser-Specific Issues
- **Clear browser cache** and hard refresh (Ctrl+F5)
- **Disable browser extensions** that might interfere
- **Try incognito/private mode**
- **Check browser console** for additional error details

### 4. Environment-Specific Fixes

#### Development Environment
```bash
# Set environment variables
export REACT_APP_API_URL=http://localhost:5000/api
export FRONTEND_URL=http://localhost:3000

# Restart both frontend and backend
```

#### Production Environment
```bash
# Update Kubernetes ConfigMap
kubectl patch configmap gigmatch-config -n gigmatch \
  --patch '{"data":{"REACT_APP_API_URL":"http://your-domain.com/api"}}'

# Restart deployments
kubectl rollout restart deployment/gigmatch-backend -n gigmatch
kubectl rollout restart deployment/gigmatch-frontend -n gigmatch
```

## 🚀 Quick Fix Commands

### 1. Restart Services
```bash
# Restart backend
kubectl rollout restart deployment/gigmatch-backend -n gigmatch

# Restart frontend  
kubectl rollout restart deployment/gigmatch-frontend -n gigmatch

# Wait for rollout
kubectl rollout status deployment/gigmatch-backend -n gigmatch
kubectl rollout status deployment/gigmatch-frontend -n gigmatch
```

### 2. Apply Updated ConfigMap
```bash
kubectl apply -f k8s/configMap.yaml
```

### 3. Verify Configuration
```bash
# Check ConfigMap
kubectl get configmap gigmatch-config -n gigmatch -o yaml

# Check environment variables in pods
kubectl exec -it $(kubectl get pods -l app=gigmatch-backend -n gigmatch -o jsonpath='{.items[0].metadata.name}') -n gigmatch -- env | grep FRONTEND_URL
```

## 🔒 Security Considerations

### Production CORS Settings
For production, use more restrictive CORS settings:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL, // Only allow specific domain
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Environment Variables
```bash
# Production
FRONTEND_URL=https://your-domain.com
REACT_APP_API_URL=https://api.your-domain.com/api

# Development  
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000/api
```

## 📋 Checklist

- [ ] Backend running on port 5000
- [ ] Frontend configured to use port 5000
- [ ] CORS allows frontend origin
- [ ] Environment variables set correctly
- [ ] ConfigMap updated and applied
- [ ] Services restarted
- [ ] Browser cache cleared
- [ ] Network connectivity verified

## 🆘 Still Having Issues?

If CORS issues persist after following these steps:

1. **Check browser console** for detailed error messages
2. **Verify network tab** in developer tools
3. **Test with curl** to isolate frontend vs backend issues
4. **Check Kubernetes logs** for both frontend and backend
5. **Verify ingress configuration** if using Kubernetes ingress

## 📞 Support

For additional help:
1. Check the browser console for specific error messages
2. Review the backend logs for CORS-related errors
3. Test the API endpoints directly with curl or Postman
4. Verify all environment variables are correctly set 