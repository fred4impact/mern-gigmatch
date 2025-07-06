const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  talent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  proposedRate: {
    type: Number,
    min: 0
  },
  availability: {
    type: String,
    trim: true,
    maxlength: 500
  },
  portfolio: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  respondedAt: {
    type: Date
  },
  responseMessage: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Index for efficient queries
ApplicationSchema.index({ event: 1, talent: 1 }, { unique: true });
ApplicationSchema.index({ talent: 1, status: 1 });
ApplicationSchema.index({ event: 1, status: 1 });

// Virtual for application age
ApplicationSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
ApplicationSchema.set('toJSON', { virtuals: true });
ApplicationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Application', ApplicationSchema); 