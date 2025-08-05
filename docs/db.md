# Database Setup & Commands - GigMatch

## 🗄️ Database Configuration

### MongoDB Setup
- **Database Name**: `gigmatch`
- **Connection String**: `mongodb://localhost:27017/gigmatch`
- **Status**: ✅ Running (via Homebrew)

### Environment Variables
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/gigmatch
```

## 🚀 Development Commands

### Install Dependencies
```bash
# Root dependencies (concurrently for running both servers)
npm install

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd frontend && npm install
```

### Start Development Servers
```bash
# Start both backend and frontend concurrently (recommended)
npm run dev

# Or start servers separately:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

### Port Configuration
- **Backend**: Port 5000 (changed from 5000 due to AirPlay conflict)
- **Frontend**: Port 3000
- **Frontend Proxy**: Points to http://localhost:5000

### Database Commands
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB (if not running)
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community

# Restart MongoDB
brew services restart mongodb-community
```

### API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Expected response:
# {"status":"OK","message":"GigMatch API is running","timestamp":"..."}
```

### Troubleshooting Commands
```bash
# Kill all Node processes
pkill -f "npm run dev"

# Check what's using port 5000
lsof -i :5000

# Check what's using port 5000
lsof -i :5000

# Check what's using port 3000
lsof -i :3000

# Kill all server processes (except database)
pkill -f "node.*server.js"    # Kills backend Node.js server
pkill -f "react-scripts"      # Kills React development server
pkill -f "nodemon"           # Kills nodemon processes

# Verify all app servers are stopped
ps aux | grep -E "(node|react|nodemon)" | grep -v grep
```

## 📁 Project Structure
```
mern-gigmatch/
├── backend/
│   ├── .env                    # Environment variables
│   ├── server.js              # Express server
│   ├── models/User.js         # User model
│   ├── controllers/           # Route controllers
│   ├── routes/                # API routes
│   └── middleware/            # Auth middleware
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main React app
│   │   ├── context/          # React context
│   │   └── services/         # API services
│   └── package.json          # Frontend dependencies
└── package.json              # Root dependencies
```

## 🔧 Environment Setup

### Backend (.env file)
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/gigmatch

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

### Frontend (package.json proxy)
```json
{
  "proxy": "http://localhost:5000"
}
```

## 🐛 Common Issues & Solutions

### Port 5000 Already in Use
**Issue**: `Error: listen EADDRINUSE: address already in use :::5000`
**Solution**: Change backend port to 5000 (AirPlay uses 5000 on macOS)

### MongoDB Connection Issues
**Issue**: Cannot connect to MongoDB
**Solution**: 
```bash
brew services start mongodb-community
```

### Frontend White Page
**Issue**: React app shows blank page
**Solution**: Check browser console for errors, ensure backend is running

## 📊 Database Models

### User Model
- **Collection**: `users`
- **Fields**: email, password, firstName, lastName, role, location, etc.
- **Indexes**: email (unique), location.coordinates (2dsphere)

### Future Models (Sprint 2+)
- **Talent**: Extended user profile for creative professionals
- **Event**: Gig/event listings
- **Booking**: Booking and payment records
- **Review**: Post-gig reviews and ratings

## 🔐 Authentication

### JWT Configuration
- **Secret**: Set in .env file
- **Expiration**: 7 days (configurable)
- **Storage**: localStorage (frontend)

### User Roles
- `talent` - Musicians, DJs, photographers, etc.
- `planner` - Event planners and organizers  
- `studio` - Studio owners and managers
- `admin` - Platform administrators

## 🚀 Deployment Notes

### Production Environment
- Use MongoDB Atlas or cloud MongoDB instance
- Set proper JWT_SECRET
- Configure CORS for production domain
- Use environment-specific variables

### Database Migration
- Mongoose handles schema changes automatically
- Use migrations for complex data transformations
- Backup data before major schema changes 

to start the app 

cd /Users/mac/Documents/mern-gigmatch
npm run dev


cd .. && ps aux | grep -E "(node|react)" | grep -v grep