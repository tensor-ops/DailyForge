const HabitCompletion = require('../models/HabitCompletion');
const { formatDate, daysDifference } = require('../utils/dates');

/**
 * Calculate streak and completion metrics for a specific habit
 */
async function calculateHabitStats(habitId, userId, startDateStr = null) {
  const completions = await HabitCompletion.find({ habitId, userId })
    .sort({ date: 1 })
    .lean();

  const totalCompletions = completions.length;
  const completionDates = completions.map((c) => c.date);
  const completionSet = new Set(completionDates);

  // Map YYYY-MM-DD -> true
  const history = {};
  completionDates.forEach((d) => {
    history[d] = true;
  });

  const todayStr = formatDate(new Date());

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = new Date();
  let checkStr = formatDate(checkDate);

  // If not completed today, check if completed yesterday to keep streak active
  if (!completionSet.has(checkStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    checkStr = formatDate(checkDate);
  }

  while (completionSet.has(checkStr)) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
    checkStr = formatDate(checkDate);
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dateStr of completionDates) {
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diff = daysDifference(prevDate, dateStr);
      if (diff === 1) {
        tempStreak++;
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = dateStr;
  }

  // Calculate completion rate based on habit age
  let completionRate = 0;
  if (startDateStr) {
    const totalDays = Math.max(1, daysDifference(startDateStr, todayStr) + 1);
    completionRate = Math.min(100, Math.round((totalCompletions / totalDays) * 100));
  }

  const completedToday = completionSet.has(todayStr);

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRate,
    completedToday,
    history,
  };
}

module.exports = {
  calculateHabitStats,
};
