const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  author: {
    type: String,
    default: 'Anonymous',
    trim: true
  },
  created_date: {
    type: Date,
    default: Date.now,
    required: true
  },
  modified_date: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  versionKey: false 
});

// Update modified_date before saving

// Update modified_date before saving
feedSchema.pre('save', function() {
  this.modified_date = new Date();
});

// Update modified_date for updates
feedSchema.pre('findOneAndUpdate', function() {
  this.set({ modified_date: new Date() });
});

module.exports = mongoose.model('Feed', feedSchema);
