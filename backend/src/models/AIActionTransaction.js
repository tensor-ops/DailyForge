const mongoose = require('mongoose');

const aiActionTransactionSchema = new mongoose.Schema(
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
    },
    actionType: {
      type: String,
      enum: [
        'BATCH_SCHEDULE_OPTIMIZATION',
        'HABIT_TIME_ADJUSTMENT',
        'EXPERIMENT_CREATION',
        'GOAL_MILESTONE_SPLIT',
        'ROUTINE_DIFFICULTY_CHANGE',
        'CUSTOM_WORKFLOW',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['STAGED', 'CONFIRMED', 'ROLLED_BACK', 'FAILED'],
      default: 'STAGED',
      index: true,
    },
    beforeState: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    afterState: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    changesSummary: [
      {
        entityType: String,
        entityId: String,
        description: String,
      },
    ],
    confirmedAt: {
      type: Date,
      default: null,
    },
    rolledBackAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

aiActionTransactionSchema.index({ userId: 1, createdAt: -1 });

aiActionTransactionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('AIActionTransaction', aiActionTransactionSchema);
