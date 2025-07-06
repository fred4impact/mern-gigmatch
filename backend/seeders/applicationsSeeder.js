const Application = require('../models/Application');
const User = require('../models/User');
const Event = require('../models/Event');

const seedApplications = async () => {
  try {
    // Clear existing applications
    await Application.deleteMany({});

    // Get existing users and events
    const users = await User.find({});
    const events = await Event.find({});

    if (users.length === 0 || events.length === 0) {
      console.log('No users or events found. Please run usersSeeder and eventsSeeder first.');
      return;
    }

    // Find talent user (John)
    const talent = users.find(u => u.role === 'talent');
    if (!talent) {
      console.log('No talent user found.');
      return;
    }

    // Create test applications
    const testApplications = [
      {
        event: events[0]._id, // Wedding Reception
        talent: talent._id,
        status: 'pending',
        message: 'I would love to perform at your wedding! I have extensive experience with jazz and acoustic music, perfect for your ceremony and reception.',
        proposedRate: 2200,
        availability: 'Available for the entire day',
        portfolio: 'https://soundcloud.com/johndoe',
        experience: '10+ years performing at weddings and events'
      },
      {
        event: events[1]._id, // Corporate Event
        talent: talent._id,
        status: 'accepted',
        message: 'Professional guitarist available for your corporate event. I can provide background music during networking sessions.',
        proposedRate: 1500,
        availability: 'Available for the full day',
        portfolio: 'https://johndoe.com/portfolio',
        experience: 'Corporate event specialist'
      },
      {
        event: events[2]._id, // Birthday Party
        talent: talent._id,
        status: 'rejected',
        message: 'I can provide acoustic guitar and vocals for the birthday party. I know all the current hits!',
        proposedRate: 600,
        availability: 'Available for the 4-hour party',
        portfolio: 'https://instagram.com/johndoe',
        experience: 'Birthday party performer'
      },
      {
        event: events[4]._id, // Rock Concert
        talent: talent._id,
        status: 'pending',
        message: 'Experienced guitarist ready to rock! I know all the classic rock songs and can handle lead guitar duties.',
        proposedRate: 2800,
        availability: 'Available for rehearsals and performance',
        portfolio: 'https://youtube.com/johndoe',
        experience: 'Rock band guitarist for 8 years'
      }
    ];

    // Create applications
    for (const appData of testApplications) {
      await Application.create(appData);
    }

    console.log('✅ Test applications seeded successfully');
    console.log('Applications created:');
    console.log('- Wedding Reception: Pending');
    console.log('- Corporate Event: Accepted');
    console.log('- Birthday Party: Rejected');
    console.log('- Rock Concert: Pending');
  } catch (error) {
    console.error('❌ Error seeding applications:', error);
  }
};

module.exports = seedApplications; 