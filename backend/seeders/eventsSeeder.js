const Event = require('../models/Event');
const User = require('../models/User');

const seedEvents = async () => {
  try {
    // Clear existing events
    await Event.deleteMany({});

    // Get existing users
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found. Please run usersSeeder first.');
      return;
    }

    // Find planner and studio users
    const planner = users.find(u => u.role === 'planner');
    const studio = users.find(u => u.role === 'studio');

    if (!planner && !studio) {
      console.log('No planner or studio users found. Please create some first.');
      return;
    }

    // Use Jane (planner) as the primary creator for all events
    const eventCreator = planner || studio;
    console.log(`Using ${eventCreator.firstName} ${eventCreator.lastName} (${eventCreator.role}) as event creator`);

    const testEvents = [
      {
        title: 'Wedding Reception - Live Music Needed',
        description: 'Looking for a talented musician or band to perform at our wedding reception. We need 3-4 hours of live music including ceremony, cocktail hour, and reception. Jazz and acoustic music preferred.',
        type: 'Wedding',
        location: {
          city: 'New York',
          state: 'NY',
          country: 'United States'
        },
        budget: 2500,
        date: new Date('2024-08-15T18:00:00Z'),
        status: 'open',
        tags: ['live music', 'wedding', 'jazz', 'acoustic'],
        musicianCategory: 'band',
        musicianTypes: ['jazz-band', 'pianist', 'vocalist'],
        musicianCount: 4,
        genre: 'Jazz, Acoustic',
        createdBy: eventCreator._id
      },
      {
        title: 'Corporate Event - Professional Photographer',
        description: 'Annual corporate event requiring professional photography services. Need coverage for keynote speakers, networking sessions, and award ceremony. High-quality photos for marketing materials.',
        type: 'Corporate',
        location: {
          city: 'Los Angeles',
          state: 'CA',
          country: 'United States'
        },
        budget: 1800,
        date: new Date('2024-07-20T09:00:00Z'),
        status: 'open',
        tags: ['photography', 'corporate', 'professional', 'events'],
        createdBy: eventCreator._id
      },
      {
        title: 'Birthday Party - DJ Services',
        description: 'Sweet 16 birthday party in need of a DJ. Looking for someone who can play current hits, hip-hop, and pop music. Party will be 4 hours long with about 50 guests.',
        type: 'Birthday',
        location: {
          city: 'Chicago',
          state: 'IL',
          country: 'United States'
        },
        budget: 800,
        date: new Date('2024-06-30T19:00:00Z'),
        status: 'open',
        tags: ['dj', 'birthday', 'party', 'music'],
        musicianCategory: 'dj',
        musicianTypes: ['wedding-dj', 'mobile-dj'],
        musicianCount: 1,
        genre: 'Pop, Hip-Hop, Current Hits',
        createdBy: eventCreator._id
      },
      {
        title: 'Jazz Festival - Musicians Needed',
        description: 'Annual jazz festival looking for talented jazz musicians and ensembles. Multiple performance slots available throughout the weekend. Professional sound system provided.',
        type: 'Festival',
        location: {
          city: 'New Orleans',
          state: 'LA',
          country: 'United States'
        },
        budget: 5000,
        date: new Date('2024-09-15T14:00:00Z'),
        status: 'open',
        tags: ['jazz', 'festival', 'live music', 'performance'],
        musicianCategory: 'musician',
        musicianTypes: ['saxophonist', 'trumpeter', 'pianist', 'drummer', 'bassist'],
        musicianCount: 8,
        genre: 'Jazz, Blues',
        createdBy: eventCreator._id
      },
      {
        title: 'Rock Concert - Full Band',
        description: 'Rock concert event requiring a complete rock band. Need guitarists, bassist, drummer, and vocalist. Must know classic rock and modern rock songs.',
        type: 'Concert',
        location: {
          city: 'Austin',
          state: 'TX',
          country: 'United States'
        },
        budget: 3000,
        date: new Date('2024-08-25T20:00:00Z'),
        status: 'open',
        tags: ['rock', 'concert', 'band', 'live music'],
        musicianCategory: 'band',
        musicianTypes: ['rock-band', 'guitarist', 'bassist', 'drummer', 'vocalist'],
        musicianCount: 5,
        genre: 'Rock, Classic Rock',
        createdBy: eventCreator._id
      },
      {
        title: 'Classical Wedding - String Quartet',
        description: 'Elegant wedding ceremony and reception requiring a string quartet. Classical music for ceremony and light classical/pop for reception. Formal attire required.',
        type: 'Wedding',
        location: {
          city: 'Boston',
          state: 'MA',
          country: 'United States'
        },
        budget: 2200,
        date: new Date('2024-07-12T16:00:00Z'),
        status: 'open',
        tags: ['classical', 'wedding', 'string quartet', 'elegant'],
        musicianCategory: 'ensemble',
        musicianTypes: ['string-quartet', 'violinist', 'cellist'],
        musicianCount: 4,
        genre: 'Classical, Light Classical',
        createdBy: eventCreator._id
      },
      {
        title: 'Product Launch - Video Production',
        description: 'Tech startup product launch event requiring professional video production. Need filming of presentations, interviews, and product demos. Will be used for marketing and social media.',
        type: 'Product Launch',
        location: {
          city: 'San Francisco',
          state: 'CA',
          country: 'United States'
        },
        budget: 3500,
        date: new Date('2024-09-10T14:00:00Z'),
        status: 'open',
        tags: ['video production', 'tech', 'product launch', 'marketing'],
        createdBy: eventCreator._id
      },
      {
        title: 'Charity Gala - Entertainment Package',
        description: 'Annual charity gala dinner requiring complete entertainment package. Need live music during dinner, auction entertainment, and background music throughout the evening.',
        type: 'Charity',
        location: {
          city: 'Miami',
          state: 'FL',
          country: 'United States'
        },
        budget: 4000,
        date: new Date('2024-10-05T17:00:00Z'),
        status: 'open',
        tags: ['charity', 'gala', 'live music', 'entertainment'],
        musicianCategory: 'ensemble',
        musicianTypes: ['jazz-trio', 'pianist', 'bassist', 'drummer'],
        musicianCount: 3,
        genre: 'Jazz, Light Jazz',
        createdBy: eventCreator._id
      }
    ];

    // Create events
    for (const eventData of testEvents) {
      await Event.create(eventData);
    }

    console.log('✅ Test events seeded successfully');
    console.log('Test events created:');
    console.log('- Wedding Reception - Live Music Needed (Jazz Band)');
    console.log('- Corporate Event - Professional Photographer');
    console.log('- Birthday Party - DJ Services');
    console.log('- Jazz Festival - Musicians Needed');
    console.log('- Rock Concert - Full Band');
    console.log('- Classical Wedding - String Quartet');
    console.log('- Product Launch - Video Production');
    console.log('- Charity Gala - Entertainment Package (Jazz Trio)');
  } catch (error) {
    console.error('❌ Error seeding events:', error);
  }
};

module.exports = seedEvents;
