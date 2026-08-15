const mongoose = require('mongoose');

const HabitMissSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
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
    reason: {
      type: String,
      enum: ['Forgot', 'Too busy', 'Too difficult', 'Wrong time', 'Low energy', 'Not important today', 'Other'],
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

HabitMissSchema.index({ habitId: 1, date: 1 }, { unique: true });

HabitMissSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('HabitMiss', HabitMissSchema);
