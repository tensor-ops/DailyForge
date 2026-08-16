const mongoose = require('mongoose');

const aiCoachingProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    preferredExecutionWindows: [
      {
        window: String,
        reliabilityRate: Number,
        isPeak: Boolean,
      },
    ],
    highFrictionPeriods: [
      {
        period: String,
        reason: String,
      },
    ],
    strongWeekdays: [{ type: String }],
    weakWeekdays: [{ type: String }],
    preferredSessionLengthMinutes: {
      type: Number,
      default: 30,
    },
    recoveryVelocityHours: {
      type: Number,
      default: 24,
    },
    successfulExperimentPatterns: [{ type: String }],
    recommendationWeights: {
      timeShifts: { type: Number, default: 1.0 },
      durationChanges: { type: Number, default: 1.0 },
      experiments: { type: Number, default: 1.0 },
      plannerBuffers: { type: Number, default: 1.0 },
    },
    lastUpdatedFromFeedback: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

aiCoachingProfileSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('AICoachingProfile', aiCoachingProfileSchema);
