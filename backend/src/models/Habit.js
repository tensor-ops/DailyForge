const mongoose = require('mongoose');
const {
  HABIT_CATEGORIES,
  HABIT_FREQUENCIES,
  HABIT_TRACKING_TYPES,
  HABIT_DIFFICULTIES,
  HABIT_FRICTION_LEVELS,
} = require('../constants/habit.constants');

const HabitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: HABIT_CATEGORIES,
      default: 'Personal',
    },
    icon: {
      type: String,
      default: 'target',
    },
    trackingType: {
      type: String,
      enum: HABIT_TRACKING_TYPES,
      default: 'binary',
    },
    frequency: {
      type: String,
      enum: HABIT_FREQUENCIES,
      default: 'daily',
    },
    customDays: {
      type: [Number], // 0=Sunday, 1=Monday, etc.
      default: [],
    },
    targetValue: {
      type: Number,
      default: 1,
    },
    unit: {
      type: String,
      default: 'times',
    },
    preferredTime: {
      type: String,
      default: '',
    },
    timeWindowStart: {
      type: String,
      default: '',
    },
    timeWindowEnd: {
      type: String,
      default: '',
    },
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
    reminderTime: {
      type: String,
      default: '',
    },
    reminderDays: {
      type: [Number],
      default: [],
    },
    difficulty: {
      type: String,
      enum: HABIT_DIFFICULTIES,
      default: 'moderate',
    },
    expectedFriction: {
      type: String,
      enum: HABIT_FRICTION_LEVELS,
      default: 'medium',
    },
    checklistItems: {
      type: [String],
      default: [],
    },
    startDate: {
      type: String,
      required: true, // YYYY-MM-DD
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    totalCompletions: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    lastCompletedAt: {
      type: String, // YYYY-MM-DD
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

HabitSchema.index({ userId: 1, isArchived: 1 });
HabitSchema.index({ userId: 1, category: 1 });
HabitSchema.index({ userId: 1, frequency: 1 });

HabitSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Habit', HabitSchema);
