const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['STREAK', 'CONSISTENCY', 'EXECUTION', 'LEARNING', 'HEALTH', 'GOALS', 'RECOVERY', 'PERFORMANCE'],
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'],
      default: 'BRONZE',
    },
    rarity: {
      type: String,
      enum: ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'],
      default: 'COMMON',
    },
    icon: {
      type: String,
      default: 'Trophy',
    },
    threshold: {
      type: Number,
      required: true,
    },
    metric: {
      type: String,
      required: true,
    },
    isMoment: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);
