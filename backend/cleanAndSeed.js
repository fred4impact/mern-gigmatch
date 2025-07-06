const mongoose = require('mongoose');
require('dotenv').config();

async function cleanAndSeed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (let collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`Dropped collection: ${collection.name}`);
    }

    console.log('Database cleaned successfully');

    // Run the main seeder
    console.log('Starting database seeding...');
    require('./seedDatabase.js');

  } catch (error) {
    console.error('Error during cleanup and seeding:', error);
  }
}

cleanAndSeed(); 