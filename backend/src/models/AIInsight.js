const mongoose = require('mongoose');
const { INSIGHT_TYPES } = require('../constants/habit.constants');

const AIInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: INSIGHT_TYPES,
      required: true,
    },
    headline: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      default: 0.85,
    },
    actionLabel: {
      type: String,
      default: '',
    },
    actionPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  {
    timestamps: true,
  }
);

AIInsightSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('AIInsight', AIInsightSchema);
