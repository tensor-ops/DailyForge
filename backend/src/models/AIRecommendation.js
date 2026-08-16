const mongoose = require('mongoose');

const aiRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
    },
    evidence: {
      metric: String,
      baseline: String,
      observed: String,
      difference: String,
      sampleCount: Number,
      timeRange: String,
    },
    confidence: {
      type: String,
      enum: ['INSUFFICIENT_DATA', 'EMERGING_SIGNAL', 'MODERATE_SIGNAL', 'STRONG_SIGNAL', 'EXPERIMENT_SUPPORTED'],
      default: 'MODERATE_SIGNAL',
    },
    expectedImpact: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'TRANSFORMATIVE'],
      default: 'HIGH',
    },
    effort: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },
    rankingScore: {
      type: Number,
      default: 0,
      index: true,
    },
    actionType: {
      type: String,
      enum: ['MOVE_IN_PLANNER', 'ADJUST_HABIT_TIME', 'RUN_EXPERIMENT', 'BREAKDOWN_GOAL', 'ACTIVATE_TWO_DAY_RULE', 'CUSTOM'],
      default: 'ADJUST_HABIT_TIME',
    },
    actionPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'APPLIED', 'DISMISSED'],
      default: 'ACTIVE',
      index: true,
    },
    feedback: {
      rating: { type: String, enum: ['HELPFUL', 'NOT_HELPFUL', null], default: null },
      reason: {
        type: String,
        enum: ['INCORRECT', 'TOO_GENERIC', 'NOT_RELEVANT', 'ALREADY_KNEW', 'BAD_TIMING', null],
        default: null,
      },
      comment: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

aiRecommendationSchema.index({ userId: 1, status: 1, rankingScore: -1 });

aiRecommendationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('AIRecommendation', aiRecommendationSchema);
