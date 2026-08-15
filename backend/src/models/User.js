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
    timezone: {
      type: String,
      default: 'UTC',
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'dark',
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
      focusAreas: {
        type: [String],
        default: [],
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
