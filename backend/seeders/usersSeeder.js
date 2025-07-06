const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});

    // Create test users
    const testUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'talent',
        category: 'musician',
        subcategory: 'Guitarist',
        phone: '+1234567890',
        location: {
          city: 'New York',
          state: 'NY',
          country: 'United States'
        },
        bio: 'Professional guitarist with 10+ years of experience in live performances and studio recordings.',
        skills: ['Acoustic Guitar', 'Electric Guitar', 'Fingerstyle', 'Jazz'],
        availability: 'Weekends and evenings available'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'planner',
        phone: '+1234567891',
        location: {
          city: 'Los Angeles',
          state: 'CA',
          country: 'United States'
        },
        organization: {
          name: 'Event Masters',
          website: 'https://eventmasters.com',
          description: 'Professional event planning services for weddings and corporate events.'
        }
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@example.com',
        password: 'password123',
        role: 'studio',
        phone: '+1234567892',
        location: {
          city: 'Chicago',
          state: 'IL',
          country: 'United States'
        },
        organization: {
          name: 'Creative Studios',
          website: 'https://creativestudios.com',
          description: 'Full-service recording studio and production company.'
        }
      }
    ];

    // Create users (password will be hashed by the model's pre-save hook)
    for (const userData of testUsers) {
      await User.create(userData);
    }

    console.log('✅ Test users seeded successfully');
    console.log('Test users:');
    console.log('- john@example.com (Talent - Guitarist)');
    console.log('- jane@example.com (Planner)');
    console.log('- mike@example.com (Studio)');
    console.log('Password for all: password123');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

module.exports = seedUsers;
