const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: 1,
      maxlength: 140,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: [
        'TASK',
        'HABIT',
        'GOAL_MILESTONE',
        'FOCUS',
        'MEETING',
        'LEARNING',
        'HEALTH',
        'BREAK',
        'CUSTOM',
      ],
      default: 'CUSTOM',
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    startTime: {
      type: String, // e.g. "09:00 AM" or "09:00"
      required: true,
    },
    endTime: {
      type: String, // e.g. "10:30 AM" or "10:30"
      required: true,
    },
    startMinutes: {
      type: Number, // Minutes from midnight (e.g. 540 for 09:00)
      required: true,
    },
    endMinutes: {
      type: Number, // Minutes from midnight (e.g. 630 for 10:30)
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 60,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'missed', 'rescheduled', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    category: {
      type: String,
      default: 'Work',
    },
    color: {
      type: String,
      default: '#F97316',
    },
    recurrenceRule: {
      type: String,
      enum: ['none', 'daily', 'weekdays', 'weekly'],
      default: 'none',
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

CalendarEventSchema.index({ userId: 1, date: 1, startMinutes: 1 });

CalendarEventSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);
