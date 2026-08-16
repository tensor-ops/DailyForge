const mongoose = require('mongoose');

const aiUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ['openai', 'gemini', 'anthropic', 'local', 'mock'],
    },
    model: {
      type: String,
      required: true,
    },
    requestType: {
      type: String,
      required: true,
      enum: [
        'COACH_CHAT',
        'INSIGHT_GENERATION',
        'HABIT_RECOMMENDATION',
        'GOAL_BREAKDOWN',
        'EXPERIMENT_DESIGN',
        'SCHEDULE_OPTIMIZATION',
        'SIGNAL_ANALYSIS',
        'RAG_EMBEDDING',
      ],
      index: true,
    },
    inputTokens: {
      type: Number,
      default: 0,
    },
    outputTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    estimatedCostUsd: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'ERROR', 'RATE_LIMITED', 'TIMEOUT', 'VALIDATION_FAILED'],
      default: 'SUCCESS',
    },
    errorMessage: {
      type: String,
      default: null,
    },
    toolsInvoked: [
      {
        toolName: String,
        durationMs: Number,
        success: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

aiUsageSchema.index({ userId: 1, createdAt: -1 });

aiUsageSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('AIUsage', aiUsageSchema);
