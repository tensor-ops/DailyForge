const mongoose = require('mongoose');

const EnergyLogSchema = new mongoose.Schema(
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
    energy: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    focus: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    mood: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

EnergyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

EnergyLogSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('EnergyLog', EnergyLogSchema);
