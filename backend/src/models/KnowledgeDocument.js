const mongoose = require('mongoose');

const knowledgeDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'HABIT_FORMATION',
        'BEHAVIOR_CHANGE',
        'GOAL_SETTING',
        'SELF_MONITORING',
        'IMPLEMENTATION_INTENTIONS',
        'PLANNING_AND_TIMEBOXING',
        'FOCUS_AND_DEEP_WORK',
        'RECOVERY_AND_SLEEP',
        'REINFORCEMENT_AND_REWARDS',
      ],
      index: true,
    },
    authorOrSource: {
      type: String,
      default: 'Behavioral Science Knowledge Base',
    },
    summary: {
      type: String,
      required: true,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

knowledgeDocumentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
