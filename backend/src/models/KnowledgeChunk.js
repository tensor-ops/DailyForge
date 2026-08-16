const mongoose = require('mongoose');

const knowledgeChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeDocument',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: [{ type: String, trim: true }],
    embedding: {
      type: [Number],
      default: [],
    },
    relevanceScore: {
      type: Number,
      default: 1.0,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeChunkSchema.index({ title: 'text', content: 'text', tags: 'text' });

knowledgeChunkSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  delete obj.embedding; // keep responses token-light
  return obj;
};

module.exports = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
