const mongoose = require('mongoose');

const aiProactiveNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['ACHIEVEMENT', 'RISK', 'RECOMMENDATION', 'RECOVERY', 'EXPERIMENT', 'GOAL', 'DAILY_BRIEF'],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    actionLabel: {
      type: String,
      default: null,
    },
    actionRoute: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDismissed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

aiProactiveNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

aiProactiveNotificationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('AIProactiveNotification', aiProactiveNotificationSchema);
