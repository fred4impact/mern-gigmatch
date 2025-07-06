const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: ['talent', 'planner', 'studio', 'admin'],
    default: 'talent',
    required: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  category: {
    type: String,
    enum: {
      values: [
        'musician', 'sound-engineer', 'dj', 'photographer', 'videographer', 
        'graphic-designer', 'stage-manager', 'caterer', 'logistics', 'mc-host',
        'venue-provider', 'decorator', 'dancer', 'comedian', 'magician', 'other'
      ],
      message: 'Please select a valid category'
    },
    required: function() { return this.role === 'talent'; },
    validate: {
      validator: function(v) {
        if (this.role === 'talent') {
          return v && v !== '' && v !== null;
        }
        return true;
      },
      message: 'Category is required for talent users'
    }
  },
  subcategory: {
    type: String,
    trim: true,
    required: function() { return this.role === 'talent'; },
    validate: {
      validator: function(v) {
        if (this.role === 'talent') {
          return v && v !== '' && v !== null;
        }
        return true;
      },
      message: 'Subcategory is required for talent users'
    }
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  availability: {
    type: String,
    trim: true,
    maxlength: [200, 'Availability description cannot exceed 200 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  location: {
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'United States'
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  organization: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters']
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid URL starting with http:// or https://']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Organization description cannot exceed 500 characters']
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  competencyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'pro', 'expert'],
    default: 'beginner',
    required: function() { return this.role === 'talent'; }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    reviews: [{
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: 500
      },
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private', 'connections'], default: 'public' },
      showLocation: { type: Boolean, default: true },
      showContact: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  const baseFields = ['firstName', 'lastName', 'email', 'phone', 'location.city'];
  let roleFields = [];
  
  if (this.role === 'talent') {
    roleFields = ['category', 'subcategory', 'bio', 'skills', 'availability'];
  } else if (this.role === 'planner' || this.role === 'studio') {
    roleFields = ['organization.name', 'organization.description'];
  }
  
  const allFields = [...baseFields, ...roleFields];
  const completed = allFields.filter(field => {
    const value = this.get(field);
    if (field === 'skills') {
      return value && Array.isArray(value) && value.length > 0;
    }
    return value && value !== '' && value !== null && value !== undefined;
  }).length;
  
  return Math.round((completed / allFields.length) * 100);
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Skip hashing if password is already hashed (starts with $2a$)
  if (this.password && this.password.startsWith('$2a$')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', userSchema); 