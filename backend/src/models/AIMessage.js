const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIConversation',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system', 'tool'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    agentType: {
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
    intent: {
      type: String,
      default: null,
    },
    evidence: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    suggestedQuickReplies: [{ type: String }],
    proposedAction: {
      actionType: { type: String, default: null },
      title: { type: String, default: null },
      currentValue: { type: String, default: null },
      proposedValue: { type: String, default: null },
      impactDescription: { type: String, default: null },
      payload: { type: mongoose.Schema.Types.Mixed, default: {} },
      status: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED', null], default: null },
    },
  },
  {
    timestamps: true,
  }
);

aiMessageSchema.index({ conversationId: 1, createdAt: 1 });

aiMessageSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('AIMessage', aiMessageSchema);
