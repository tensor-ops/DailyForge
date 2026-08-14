const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    emoji: {
      type: String,
      default: '🎯',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    targetValue: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    deadline: {
      type: String, // YYYY-MM-DD
      default: null,
    },
    habits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit',
      },
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'failed'],
      default: 'active',
    },
    milestones: [
      {
        label: String,
        targetPercent: Number,
        achievedAt: String, // YYYY-MM-DD
      },
    ],
  },
  {
    timestamps: true,
  }
);

GoalSchema.index({ userId: 1, status: 1 });

GoalSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Goal', GoalSchema);
