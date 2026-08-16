const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'HABIT_REMINDER',
  'STREAK_AT_RISK',
  'STREAK_MILESTONE',
  'PERSONAL_BEST',
  'CONSISTENCY_CHANGE',
  'MOMENTUM_CHANGE',
  'STABILITY_RISK',
  'FRICTION_ALERT',
  'NEW_DISCOVERY',
  'GOAL_UPDATE',
  'MILESTONE',
  'WEEKLY_SUMMARY',
  'DAILY_CHECKIN',
];

const NOTIFICATION_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITIES,
      default: 'NORMAL',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['habit', 'goal', 'insight', 'analytics', 'milestone', 'system'],
      default: 'system',
    },
    entityId: {
      type: String,
      default: null,
    },
    actionUrl: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    dedupKey: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, dedupKey: 1 }, { unique: true });

module.exports = mongoose.model('Notification', notificationSchema);
