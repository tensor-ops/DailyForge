const mongoose = require('mongoose');

const behaviorEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'habit_created',
        'habit_completed',
        'habit_skipped',
        'habit_missed',
        'habit_rescheduled',
        'habit_updated',
        'habit_archived',
        'goal_created',
        'goal_progress_updated',
        'milestone_completed',
        'planner_block_created',
        'planner_block_completed',
        'planner_block_moved',
        'experiment_created',
        'experiment_started',
        'experiment_completed',
        'streak_started',
        'streak_broken',
        'streak_milestone',
        'daily_review_submitted',
        'coach_session_completed',
      ],
      index: true,
    },
    entityType: {
      type: String,
      enum: ['Habit', 'Task', 'Goal', 'CalendarEvent', 'Experiment', 'Milestone', 'DailyReview', 'General'],
      default: 'General',
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      clientTime: { type: String, default: null },
      timeOfDay: { type: String, default: null },
      dayOfWeek: { type: String, default: null },
      durationMinutes: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

behaviorEventSchema.index({ userId: 1, eventType: 1, createdAt: -1 });

behaviorEventSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('BehaviorEvent', behaviorEventSchema);
