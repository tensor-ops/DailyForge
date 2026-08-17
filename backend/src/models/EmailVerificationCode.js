const mongoose = require('mongoose');

const EmailVerificationCodeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    otpHash: {
      type: String,
      required: [true, 'OTP hash is required'],
    },
    salt: {
      type: String,
      required: [true, 'Salt is required'],
    },
    purpose: {
      type: String,
      enum: ['registration', 'login', 'verification', 'reset_password'],
      default: 'registration',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry timestamp is required'],
    },
    attemptCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying the latest OTP for a given user & purpose
EmailVerificationCodeSchema.index({ email: 1, purpose: 1, createdAt: -1 });

// TTL index to automatically purge expired records after 1 hour post-expiration
EmailVerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

// Helper instance method to check if the code is expired
EmailVerificationCodeSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

// Helper instance method to check if max attempts have been exceeded
EmailVerificationCodeSchema.methods.hasExceededAttempts = function () {
  return this.attemptCount >= this.maxAttempts;
};

module.exports = mongoose.model('EmailVerificationCode', EmailVerificationCodeSchema);
