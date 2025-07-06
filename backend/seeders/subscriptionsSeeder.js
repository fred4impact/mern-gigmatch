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
      
      // Assign different subscription tiers for testing
      let tier = 'free-basic';
      if (i === 0) tier = 'pro-tier';
      else if (i === 1) tier = 'location-pro';
      else if (i === 2) tier = 'skill-focused';
      else if (i === 3) tier = 'portfolio-plus';
      else if (i === 4) tier = 'agency-plan';

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
    console.log('- Free Basic (default for remaining users)');
    console.log('- Pro Tier (1 user)');
    console.log('- Location Pro (1 user)');
    console.log('- Skill Focused (1 user)');
    console.log('- Portfolio Plus (1 user)');
    console.log('- Agency Plan (1 user)');
  } catch (error) {
    console.error('❌ Error seeding subscriptions:', error);
  }
};

module.exports = seedSubscriptions; 