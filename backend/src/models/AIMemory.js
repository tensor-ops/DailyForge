const mongoose = require('mongoose');

const aiMemorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['FACT', 'ANALYTIC', 'EPISODIC'],
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.85,
    },
    source: {
      type: String,
      enum: ['USER_EXPLICIT', 'BEHAVIOR_OBSERVATION', 'EXPERIMENT_RESULT', 'MILESTONE_UNLOCKED', 'COACH_SESSION', 'SYSTEM_HEURISTIC'],
      default: 'BEHAVIOR_OBSERVATION',
    },
    tags: [{ type: String, trim: true }],
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

aiMemorySchema.index({ userId: 1, type: 1, key: 1 });
aiMemorySchema.index({ userId: 1, isActive: 1 });

aiMemorySchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('AIMemory', aiMemorySchema);
