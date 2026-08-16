const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    date: { type: String, required: true },
    scheduled: { type: Boolean, default: true },
    completed: { type: Boolean, default: false },
    adheredToIntervention: { type: Boolean, default: true },
    score: { type: Number, default: 80 },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const experimentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    question: {
      type: String,
      required: true,
    },
    hypothesis: {
      type: String,
      required: true,
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      default: null,
      index: true,
    },
    habitName: {
      type: String,
      default: 'Routine Habit',
    },
    category: {
      type: String,
      default: 'General',
    },
    interventionType: {
      type: String,
      enum: [
        'SCHEDULE_TIME',
        'REDUCE_FRICTION',
        'MINIMUM_VIABLE',
        'HABIT_STACK',
        'ENVIRONMENT',
        'FOCUS_BLOCK',
        'RECOVERY_PROTOCOL',
        'CUSTOM',
      ],
      default: 'SCHEDULE_TIME',
    },
    interventionDetails: {
      originalTime: { type: String, default: '09:00 PM' },
      experimentTime: { type: String, default: '07:30 PM' },
      notes: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'BASELINE',
        'ACTIVE',
        'PAUSED',
        'COMPLETED',
        'SUCCESSFUL',
        'PARTIALLY_SUCCESSFUL',
        'INCONCLUSIVE',
        'NO_IMPROVEMENT',
        'NEGATIVE',
        'DISCARDED',
      ],
      default: 'ACTIVE',
      index: true,
    },
    startDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    endDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    durationDays: {
      type: Number,
      default: 14,
    },
    dayProgress: {
      type: Number,
      default: 1,
    },
    baselineMetric: {
      type: String,
      default: 'Completion Rate',
    },
    baselineValue: {
      type: Number,
      default: 72,
    },
    targetValue: {
      type: Number,
      default: 80,
    },
    currentValue: {
      type: Number,
      default: 72,
    },
    finalValue: {
      type: Number,
      default: null,
    },
    improvementPts: {
      type: Number,
      default: 0,
    },
    interventionAdherence: {
      type: Number,
      default: 85,
    },
    isApplied: {
      type: Boolean,
      default: false,
    },
    appliedAt: {
      type: Date,
      default: null,
    },
    verdict: {
      type: String,
      default: '',
    },
    recommendation: {
      type: String,
      default: '',
    },
    sideEffects: {
      reliability: { type: String, default: '+12 pts' },
      friction: { type: String, default: '-18%' },
      avgDuration: { type: String, default: '-7 min' },
    },
    dailyObservations: [observationSchema],
    result: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

experimentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Experiment', experimentSchema);
