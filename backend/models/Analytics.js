const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    // Privacy-respecting: store hashed IP only
    hashedIp: {
      type: String,
      default: 'unknown',
    },
    referrer: {
      type: String,
      default: 'Direct',
      trim: true,
    },
    country: {
      type: String,
      default: 'Unknown',
    },
    city: {
      type: String,
      default: 'Unknown',
    },
    // Parsed from User-Agent
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    // Don't create extra timestamps — we have our own
    timestamps: false,
  }
);

// Compound index for analytics queries (urlId + timestamp)
analyticsSchema.index({ urlId: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
