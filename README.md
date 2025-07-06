# 🎯 GigMatch

**Smart, location-aware talent matchmaking platform for creative professionals**

GigMatch connects event planners, studios, and verified service providers using AI-powered suggestions, secure bookings, and end-to-end collaboration tools.

## 🚀 Features

- **AI-Powered Matchmaking** - Smart recommendations based on skills, location, and availability
- **Location-Aware Booking** - Find gigs within optimal travel time from your location
- **Secure Payments** - Deposit-based bookings with Stripe integration
- **Seamless Communication** - Built-in messaging and booking flow
- **Analytics Dashboard** - Track your gig stats and performance
- **Verified Reviews** - Post-gig reviews with admin moderation
- **Multi-Role Support** - Musicians, DJs, photographers, stylists, sound engineers, and more

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Stripe** - Payment processing
- **Cloudinary** - Image uploads

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Bootstrap** - CSS framework
- **React Bootstrap** - Bootstrap components
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd mern-gigmatch
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment
Create a `.env` file in the `backend` directory:
```bash
cd backend
cp env.example .env
```

Edit the `.env` file with your configuration:
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

# Optional: Add these for future features
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-email-password
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
# STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
# STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
# GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 4. Start the development servers

#### Option 1: Run both servers concurrently (recommended)
```bash
# From the root directory
npm run dev
```

#### Option 2: Run servers separately
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 5. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Health Check: http://localhost:5000/api/health

## 📁 Project Structure

```
mern-gigmatch/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── seeders/         # Database seeders
│   ├── utils/           # Utility functions
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── App.js       # Main app component
│   │   └── index.js     # Entry point
│   └── package.json
├── package.json         # Root package.json
└── README.md
```

## 🔐 Authentication

The app supports role-based authentication with the following user types:
- **Talent** - Musicians, DJs, photographers, etc.
- **Planner** - Event planners and organizers
- **Studio** - Studio owners and managers
- **Admin** - Platform administrators

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables for production
2. Deploy to platforms like:
   - Heroku
   - Railway
   - Render
   - DigitalOcean

### Frontend Deployment
1. Build the production version:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy to platforms like:
   - Vercel
   - Netlify
   - GitHub Pages

## 🔧 Development

### Available Scripts

#### Root Directory
- `npm run dev` - Start both backend and frontend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend server
- `npm run install-all` - Install dependencies for all packages

#### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Run database seeders

#### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Health Check
- `GET /api/health` - API health status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Roadmap

### Sprint 1 ✅ (Current)
- [x] Project setup and authentication
- [x] User registration and login
- [x] Basic UI with React and Bootstrap
- [x] Role-based authentication

### Sprint 2 (Next)
- [ ] User profiles and listings
- [ ] Talent profile with skills and availability
- [ ] Event listing forms
- [ ] Profile editing features

### Sprint 3 (Future)
- [ ] Event discovery and matchmaking
- [ ] AI-powered matching logic
- [ ] Search and filtering
- [ ] Interest expression system

### Sprint 4 (Future)
- [ ] Booking and messaging
- [ ] Stripe integration
- [ ] Chat system
- [ ] Booking dashboard

### Sprint 5 (Future)
- [ ] Reviews and analytics
- [ ] Admin panel
- [ ] Performance tracking
- [ ] Moderation system

---

**Built with ❤️ for creative professionals**
