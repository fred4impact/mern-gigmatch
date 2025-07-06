const mongoose = require('mongoose');
require('dotenv').config();

// Import seeders
const seedUsers = require('./seeders/usersSeeder');
const seedEvents = require('./seeders/eventsSeeder');
const seedApplications = require('./seeders/applicationsSeeder');
const seedSubscriptions = require('./seeders/subscriptionsSeeder');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gigmatch', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Run seeders in order
    await seedUsers();
    await seedEvents();
    await seedApplications();
    await seedSubscriptions();
    
    console.log('✅ Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase(); 