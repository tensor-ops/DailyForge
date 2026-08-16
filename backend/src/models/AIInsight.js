const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'PATTERN',
        'RECOMMENDATION',
        'WARNING',
        'OPPORTUNITY',
        'CELEBRATION',
        'EXPERIMENT',
        'GOAL',
        'RECOVERY',
        'PLANNING',
      ],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['CIRCADIAN', 'FRICTION', 'MOMENTUM', 'RECOVERY', 'CONSISTENCY', 'GOAL_ALIGNMENT', 'EXPERIMENTATION'],
      default: 'CONSISTENCY',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
    },
    isTopInsight: {
      type: Boolean,
      default: false,
      index: true,
    },
    confidence: {
      type: String,
      enum: ['INSUFFICIENT_DATA', 'EMERGING_SIGNAL', 'MODERATE_SIGNAL', 'STRONG_SIGNAL', 'EXPERIMENT_SUPPORTED'],
      default: 'MODERATE_SIGNAL',
    },
    evidence: {
      metric: String,
      headline: String,
      baseline: String,
      observed: String,
      difference: String,
      sampleCount: Number,
      timeRange: String,
      breakdown: [
        {
          label: String,
          value: String,
          rate: Number,
        },
      ],
    },
    actionLabel: {
      type: String,
      default: null,
    },
    actionType: {
      type: String,
      enum: ['VIEW_EVIDENCE', 'TRY_IN_PLANNER', 'START_EXPERIMENT', 'ADJUST_HABIT', 'REVIEW_GOAL', 'NONE'],
      default: 'VIEW_EVIDENCE',
    },
    actionPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    feedback: {
      rating: { type: String, enum: ['HELPFUL', 'NOT_HELPFUL', null], default: null },
      comment: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

aiInsightSchema.index({ userId: 1, isTopInsight: -1, createdAt: -1 });

aiInsightSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('AIInsight', aiInsightSchema);
