const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  categories: {
    professionalism: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationNote: String
}, {
  timestamps: true
});

// Indexes for efficient queries
ReviewSchema.index({ reviewedUser: 1, createdAt: -1 });
ReviewSchema.index({ event: 1 });
ReviewSchema.index({ application: 1 });
ReviewSchema.index({ reviewer: 1, reviewedUser: 1, event: 1 }, { unique: true });
ReviewSchema.index({ status: 1 });

// Virtual for overall category rating
ReviewSchema.virtual('categoryAverage').get(function() {
  if (!this.categories) return this.rating;
  
  const categoryRatings = Object.values(this.categories).filter(rating => rating);
  if (categoryRatings.length === 0) return this.rating;
  
  return categoryRatings.reduce((sum, rating) => sum + rating, 0) / categoryRatings.length;
});

// Pre-save middleware to ensure only one review per event per reviewer
ReviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingReview = await this.constructor.findOne({
      reviewer: this.reviewer,
      reviewedUser: this.reviewedUser,
      event: this.event
    });
    
    if (existingReview) {
      return next(new Error('You have already reviewed this user for this event'));
    }
  }
  next();
});

// Post-save middleware to update user's average rating
ReviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    await this.updateUserRating();
  }
});

// Method to update user's average rating
ReviewSchema.methods.updateUserRating = async function() {
  const User = mongoose.model('User');
  
  // Get all approved reviews for the reviewed user
  const reviews = await this.constructor.find({
    reviewedUser: this.reviewedUser,
    status: 'approved'
  });
  
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await User.findByIdAndUpdate(this.reviewedUser, {
      'rating.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal
      'rating.totalReviews': reviews.length
    });
  }
};

// Static method to get average rating for a user
ReviewSchema.statics.getAverageRating = async function(userId) {
  const reviews = await this.find({
    reviewedUser: userId,
    status: 'approved'
  });
  
  if (reviews.length === 0) return 0;
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((totalRating / reviews.length) * 10) / 10;
};

// Static method to get reviews by category
ReviewSchema.statics.getReviewsByCategory = async function(userId, category) {
  return this.find({
    reviewedUser: userId,
    status: 'approved',
    [`categories.${category}`]: { $exists: true, $ne: null }
  }).populate('reviewer', 'firstName lastName avatar');
};

module.exports = mongoose.model('Review', ReviewSchema); 