const User = require('../models/User');
const Habit = require('../models/Habit');
const { NotFoundError } = require('../utils/errors');

async function getUserProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Calculate aggregated stats across user's habits
  const habits = await Habit.find({ userId, isArchived: false }).lean();
  const totalHabitsCount = habits.length;

  let maxStreak = 0;
  let currStreak = 0;
  let totalRateSum = 0;

  habits.forEach((h) => {
    if (h.longestStreak > maxStreak) maxStreak = h.longestStreak;
    if (h.currentStreak > currStreak) currStreak = h.currentStreak;
    totalRateSum += h.completionRate || 0;
  });

  const overallCompletionRate = totalHabitsCount > 0 ? Math.round(totalRateSum / totalHabitsCount) : 0;

  const userObj = user.toJSON();
  return {
    ...userObj,
    joinedDate: user.createdAt.toISOString().split('T')[0],
    currentStreak: currStreak,
    longestStreak: maxStreak,
    totalHabitsCount,
    overallCompletionRate,
  };
}

async function updateUserProfile(userId, updateData) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (updateData.name) user.name = updateData.name;
  if (updateData.avatarUrl !== undefined) user.avatarUrl = updateData.avatarUrl;
  if (updateData.timezone) user.timezone = updateData.timezone;

  if (updateData.preferences) {
    user.preferences = {
      ...user.preferences.toObject(),
      ...updateData.preferences,
    };
  }

  await user.save();
  return getUserProfile(userId);
}

module.exports = {
  getUserProfile,
  updateUserProfile,
};
