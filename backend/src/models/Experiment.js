const mongoose = require('mongoose');

const ExperimentSchema = new mongoose.Schema(
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
    hypothesis: {
      type: String,
      required: true,
    },
    durationDays: {
      type: Number,
      default: 14,
    },
    startDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    endDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    baselineMetric: {
      type: String,
      required: true,
    },
    targetValue: {
      type: Number,
      required: true,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'discarded'],
      default: 'active',
      index: true,
    },
    result: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

ExperimentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Experiment', ExperimentSchema);
