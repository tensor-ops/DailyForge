const mongoose = require('mongoose');
const { hashPassword, comparePassword } = require('../utils/password');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      minlength: 2,
      maxlength: 50,
      default: function () {
        if (this.name) {
          return this.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        }
        return 'forger';
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 300,
      default: 'Forging daily discipline and habits with Daily Forge.',
    },
    membershipTier: {
      type: String,
      enum: ['free', 'pro', 'beta', 'admin'],
      default: 'pro', // Default pro experience in Daily Forge beta
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    language: {
      type: String,
      default: 'en',
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'dark',
      },
      themeName: {
        type: String,
        enum: ['forge-dark', 'forge-light', 'focus-blue', 'forest', 'amber-forge', 'monochrome'],
        default: 'forge-dark',
      },
      accentTheme: {
        type: String,
        enum: ['midnight', 'arctic', 'indigo', 'emerald', 'ember', 'rose'],
        default: 'midnight',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      dailyReminderTime: {
        type: String,
        default: '08:00',
      },
      aiInsightsEnabled: {
        type: Boolean,
        default: true,
      },
      weeklyReportEnabled: {
        type: Boolean,
        default: true,
      },
      weekStartsOn: {
        type: String,
        enum: ['monday', 'sunday'],
        default: 'monday',
      },
      aiCoachingStyle: {
        type: String,
        enum: ['direct', 'encouraging', 'analytical', 'balanced'],
        default: 'balanced',
      },
      preferredFocusTime: {
        type: String,
        default: 'Morning',
      },
      focusAreas: {
        type: [String],
        default: ['Learning', 'Fitness', 'Productivity'],
      },
      dailyCommitment: {
        type: String,
        default: '',
      },
      goals: {
        type: [String],
        default: [],
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing pre-save hook
UserSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  if (!this.passwordHash.startsWith('$2a$') && !this.passwordHash.startsWith('$2b$')) {
    this.passwordHash = await hashPassword(this.passwordHash);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return comparePassword(candidatePassword, this.passwordHash);
};

// Safe JSON transform (exclude passwordHash)
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
