const mongoose = require('mongoose');

const aiMemoryEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    memoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIMemory',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['CREATED', 'ACCESSED', 'REINFORCED', 'UPDATED', 'INVALIDATED', 'EXPIRED'],
      required: true,
    },
    context: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

aiMemoryEventSchema.index({ userId: 1, memoryId: 1, createdAt: -1 });

module.exports = mongoose.model('AIMemoryEvent', aiMemoryEventSchema);
