const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  tier: {
    type: String,
    enum: ['free-basic', 'pro-tier', 'location-pro', 'skill-focused', 'portfolio-plus', 'agency-plan'],
    default: 'free-basic',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'active'
  },
  features: {
    leadsPerMonth: {
      type: Number,
      default: 5 // Free basic limit
    },
    aiBoosted: {
      type: Boolean,
      default: false
    },
    locationFiltering: {
      type: Boolean,
      default: false
    },
    skillFiltering: {
      type: Boolean,
      default: false
    },
    portfolioGallery: {
      type: Boolean,
      default: false
    },
    groupAccounts: {
      type: Boolean,
      default: false
    },
    priorityListing: {
      type: Boolean,
      default: false
    }
  },
  paymentInfo: {
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    lastPaymentDate: Date,
    nextPaymentDate: Date,
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  usage: {
    leadsUsed: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
SubscriptionSchema.index({ user: 1 });
SubscriptionSchema.index({ tier: 1, status: 1 });
SubscriptionSchema.index({ 'paymentInfo.stripeCustomerId': 1 });

// Virtual for remaining leads
SubscriptionSchema.virtual('leadsRemaining').get(function() {
  if (this.tier === 'free-basic') {
    return Math.max(0, this.features.leadsPerMonth - this.usage.leadsUsed);
  }
  return -1; // Unlimited for paid tiers
});

// Virtual for subscription status
SubscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && (!this.endDate || this.endDate > new Date());
});

// Method to check if user can apply to more events
SubscriptionSchema.methods.canApplyToEvent = function() {
  if (this.tier === 'free-basic') {
    return this.usage.leadsUsed < this.features.leadsPerMonth;
  }
  return true; // Paid tiers have unlimited applications
};

// Method to increment leads used
SubscriptionSchema.methods.incrementLeadsUsed = function() {
  if (this.tier === 'free-basic') {
    this.usage.leadsUsed += 1;
    return this.save();
  }
  return Promise.resolve();
};

// Method to reset monthly usage
SubscriptionSchema.methods.resetMonthlyUsage = function() {
  const now = new Date();
  const lastReset = new Date(this.usage.lastResetDate);
  
  // Check if it's a new month
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usage.leadsUsed = 0;
    this.usage.lastResetDate = now;
    return this.save();
  }
  return Promise.resolve();
};

// Pre-save middleware to set features based on tier
SubscriptionSchema.pre('save', function(next) {
  const tierFeatures = {
    'free-basic': {
      leadsPerMonth: 5,
      aiBoosted: false,
      locationFiltering: false,
      skillFiltering: false,
      portfolioGallery: false,
      groupAccounts: false,
      priorityListing: false
    },
    'pro-tier': {
      leadsPerMonth: -1, // Unlimited
      aiBoosted: true,
      locationFiltering: false,
      skillFiltering: false,
      portfolioGallery: false,
      groupAccounts: false,
      priorityListing: true
    },
    'location-pro': {
      leadsPerMonth: -1,
      aiBoosted: true,
      locationFiltering: true,
      skillFiltering: false,
      portfolioGallery: false,
      groupAccounts: false,
      priorityListing: true
    },
    'skill-focused': {
      leadsPerMonth: -1,
      aiBoosted: true,
      locationFiltering: true,
      skillFiltering: true,
      portfolioGallery: false,
      groupAccounts: false,
      priorityListing: true
    },
    'portfolio-plus': {
      leadsPerMonth: -1,
      aiBoosted: true,
      locationFiltering: true,
      skillFiltering: true,
      portfolioGallery: true,
      groupAccounts: false,
      priorityListing: true
    },
    'agency-plan': {
      leadsPerMonth: -1,
      aiBoosted: true,
      locationFiltering: true,
      skillFiltering: true,
      portfolioGallery: true,
      groupAccounts: true,
      priorityListing: true
    }
  };

  if (this.isModified('tier')) {
    this.features = tierFeatures[this.tier];
  }

  next();
});

module.exports = mongoose.model('Subscription', SubscriptionSchema); 