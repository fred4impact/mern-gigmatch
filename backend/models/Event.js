const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    trim: true,
    maxlength: 60
  },
  location: {
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  budget: {
    type: Number,
    min: 0
  },
  date: {
    type: Date
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'cancelled'],
    default: 'open'
  },
  tags: [{ type: String, trim: true }],
  musicianCategory: {
    type: String,
    enum: ['musician', 'dj', 'band', 'ensemble', 'orchestra', 'choir', 'other'],
    trim: true
  },
  musicianTypes: [{
    type: String,
    enum: [
      'drummer', 'guitarist', 'bassist', 'keyboardist', 'pianist', 'saxophonist', 
      'trumpeter', 'violinist', 'cellist', 'flutist', 'clarinetist', 'trombonist',
      'vocalist', 'singer', 'percussionist', 'accordionist', 'harmonica', 'banjo',
      'wedding-dj', 'club-dj', 'mobile-dj', 'radio-dj',
      'jazz-band', 'rock-band', 'pop-band', 'country-band', 'blues-band', 
      'reggae-band', 'folk-band', 'indie-band', 'cover-band', 'tribute-band',
      'string-quartet', 'brass-quintet', 'woodwind-quintet', 'jazz-trio',
      'piano-trio', 'duo', 'solo-artist',
      'mc', 'emcee', 'karaoke', 'other'
    ],
    trim: true
  }],
  musicianCount: {
    type: Number,
    min: 1,
    max: 50
  },
  genre: {
    type: String,
    trim: true,
    maxlength: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', EventSchema); 