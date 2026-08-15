const mongoose = require('mongoose');

const DailySnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    plannedHabits: {
      type: Number,
      default: 0,
    },
    completedHabits: {
      type: Number,
      default: 0,
    },
    missedHabits: {
      type: Number,
      default: 0,
    },
    plannedTasks: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    executionRate: {
      type: Number,
      default: 0,
    },
    focusMinutes: {
      type: Number,
      default: 0,
    },
    forgeScore: {
      type: Number,
      default: 0,
    },
    consistencyScore: {
      type: Number,
      default: 0,
    },
    momentumScore: {
      type: Number,
      default: 0,
    },
    capacityMinutes: {
      type: Number,
      default: 0,
    },
    plannedMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

DailySnapshotSchema.index({ userId: 1, date: 1 }, { unique: true });

DailySnapshotSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('DailySnapshot', DailySnapshotSchema);
