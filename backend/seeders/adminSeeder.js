const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gigmatch';

const adminData = {
  email: 'admin@gigmatch.com',
  password: 'AdminPass123!', // Change after first login
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isVerified: true,
  isActive: true
};

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    let admin = await User.findOne({ email: adminData.email });
    if (admin) {
      console.log('Admin user already exists:', admin._id, admin.email);
    } else {
      admin = new User(adminData);
      await admin.save();
      console.log('Admin user created:', admin._id, admin.email);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin user:', err);
    process.exit(1);
  }
}

seedAdmin(); 