const mongoose = require('mongoose');

const DailyReviewSchema = new mongoose.Schema(
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
    rating: {
      type: String,
      enum: ['great', 'good', 'okay', 'difficult'],
      default: 'good',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    completedItems: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    focusMinutes: {
      type: Number,
      default: 0,
    },
    forgeNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

DailyReviewSchema.index({ userId: 1, date: 1 }, { unique: true });

DailyReviewSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('DailyReview', DailyReviewSchema);
