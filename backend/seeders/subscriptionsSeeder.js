const Subscription = require('../models/Subscription');
const User = require('../models/User');

const seedSubscriptions = async () => {
  try {
    // Clear existing subscriptions
    await Subscription.deleteMany({});

    // Get existing users
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found. Please run usersSeeder first.');
      return;
    }

    // Create subscriptions for talent users
    const talentUsers = users.filter(user => user.role === 'talent');
    
    for (let i = 0; i < talentUsers.length; i++) {
      const user = talentUsers[i];
      
      // Assign 'pro' to the first user, 'free' to the rest
      let tier = i === 0 ? 'pro' : 'free';

      const subscription = new Subscription({
        user: user._id,
        tier: tier,
        status: 'active',
        usage: {
          leadsUsed: Math.floor(Math.random() * 3), // Random usage for testing
          lastResetDate: new Date()
        }
      });

      await subscription.save();
    }

    console.log('✅ Test subscriptions seeded successfully');
    console.log('Subscription tiers created:');
    console.log('- Pro (1 user)');
    console.log('- Free (remaining users)');
  } catch (error) {
    console.error('❌ Error seeding subscriptions:', error);
  }
};

module.exports = seedSubscriptions; 