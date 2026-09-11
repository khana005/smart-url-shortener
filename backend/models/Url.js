const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const urlSchema = new mongoose.Schema(
  {
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Optional password protection
    password: {
      type: String,
      default: null,
      select: false, // Never return in queries by default
    },
    isPasswordProtected: {
      type: Boolean,
      default: false,
    },
    // Link expiration
    expiresAt: {
      type: Date,
      default: null,
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Click tracking
    clicks: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if provided
urlSchema.pre('save', async function () {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.isPasswordProtected = true;
  }
});

// Compare entered password with stored hash
urlSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

// Virtual: check if link is expired
urlSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual: compute status
urlSchema.virtual('status').get(function () {
  if (!this.isActive) return 'inactive';
  if (this.expiresAt && new Date() > this.expiresAt) return 'expired';
  return 'active';
});

urlSchema.set('toJSON', { virtuals: true });
urlSchema.set('toObject', { virtuals: true });

// Indexes for performance
urlSchema.index({ userId: 1, createdAt: -1 }); // Dashboard listing
// Note: shortCode already indexed via unique:true — no duplicate needed
// Note: No TTL index — expired docs are kept so "expired" status shows in dashboard

module.exports = mongoose.model('Url', urlSchema);
