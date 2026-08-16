const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    weight: {
      type: Number,
      default: 1,
      min: 0.1,
    },
    dueDate: {
      type: String, // YYYY-MM-DD
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const ProgressHistorySchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  source: {
    type: String,
    enum: ['manual', 'milestone', 'habit', 'task', 'system'],
    default: 'manual',
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  },
});

const GoalActivitySchema = new mongoose.Schema({
  activityType: {
    type: String,
    enum: [
      'CREATED',
      'PROGRESS_UPDATED',
      'MILESTONE_COMPLETED',
      'MILESTONE_ADDED',
      'HABIT_LINKED',
      'HABIT_UNLINKED',
      'TASK_LINKED',
      'TASK_COMPLETED',
      'STATUS_CHANGED',
      'PAUSED',
      'RESUMED',
      'ARCHIVED',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

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
      maxlength: 140,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'Career',
        'Education',
        'Health',
        'Finance',
        'Personal',
        'Fitness',
        'Relationships',
        'Projects',
        'Other',
      ],
      default: 'Career',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['ON_TRACK', 'AHEAD', 'AT_RISK', 'BEHIND', 'COMPLETED', 'PAUSED', 'OVERDUE'],
      default: 'ON_TRACK',
    },
    targetType: {
      type: String,
      enum: ['percentage', 'numeric', 'count', 'completion', 'milestone_based', 'custom'],
      default: 'percentage',
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    targetValue: {
      type: Number,
      default: 100,
    },
    unit: {
      type: String,
      default: '%',
    },
    startDate: {
      type: String, // YYYY-MM-DD
      default: () => new Date().toISOString().split('T')[0],
    },
    targetDate: {
      type: String, // YYYY-MM-DD
      default: null,
    },
    deadline: {
      type: String, // YYYY-MM-DD for backward-compatibility
      default: null,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    velocity: {
      type: Number,
      default: 0, // e.g. +6% per week
    },
    expectedCompletionDate: {
      type: String,
      default: null,
    },
    habits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit',
      },
    ],
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    milestones: [MilestoneSchema],
    progressHistory: [ProgressHistorySchema],
    activities: [GoalActivitySchema],
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    emoji: {
      type: String,
      default: '🎯',
    },
    color: {
      type: String,
      default: '#F97316',
    },
  },
  {
    timestamps: true,
  }
);

GoalSchema.index({ userId: 1, isArchived: 1, status: 1 });

GoalSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Goal', GoalSchema);
