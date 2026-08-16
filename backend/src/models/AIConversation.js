const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Execution Strategy Session',
      trim: true,
    },
    activeAgent: {
      type: String,
      enum: [
        'HABIT_COACH',
        'PLANNER_OPTIMIZER',
        'GOAL_STRATEGIST',
        'MOMENTUM_ANALYST',
        'RECOVERY_COACH',
        'PROGRESS_NARRATOR',
        'EXPERIMENT_SCIENTIST',
        'GENERAL_COACH',
      ],
      default: 'GENERAL_COACH',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

aiConversationSchema.index({ userId: 1, lastMessageAt: -1 });

aiConversationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('AIConversation', aiConversationSchema);
