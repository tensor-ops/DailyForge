const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const { calculateHabitStats } = require('./streak.service');
const { formatDate, getPastDateStr } = require('../utils/dates');

async function getAnalyticsOverview(userId, timeRange = '30d') {
  const days = parseTimeRangeDays(timeRange);
  const startDateStr = getPastDateStr(days);
  const todayStr = formatDate(new Date());

  const habits = await Habit.find({ userId, isArchived: false }).lean();
  const habitStats = await Promise.all(
    habits.map(async (h) => {
      const stats = await calculateHabitStats(h._id, userId, h.startDate);
      return {
        id: h._id.toString(),
        name: h.name,
        category: h.category,
        color: h.color,
        streak: stats.currentStreak,
        completionRate: stats.completionRate,
        totalCompletions: stats.totalCompletions,
      };
    })
  );

  // Overall consistency score calculation
  const consistencyScore = calculateConsistencyScore(habitStats);

  // Total completions in period
  const totalCompletionsPeriod = await HabitCompletion.countDocuments({
    userId,
    date: { $gte: startDateStr, $lte: todayStr },
  });

  const avgDailyRate = habits.length > 0 ? Math.round(totalCompletionsPeriod / (days || 1)) : 0;

  // Best & Weakest performing habits
  const sortedByRate = [...habitStats].sort((a, b) => b.completionRate - a.completionRate);
  const bestPerformingHabit = sortedByRate[0] || null;
  const weakestHabit = sortedByRate.length > 1 ? sortedByRate[sortedByRate.length - 1] : null;

  // Daily Trends
  const dailyTrends = await getDailyTrends(userId, days);

  // Category Breakdown
  const categoryBreakdown = getCategoryBreakdown(habitStats);

  // Habit Comparisons
  const habitComparisons = habitStats.map((h) => ({
    habitId: h.id,
    habitName: h.name,
    completionRate: h.completionRate,
    streak: h.streak,
  }));

  // Weekly Performance
  const weeklyPerformance = await getWeeklyPerformance(userId, days);

  return {
    consistencyScore,
    totalCompletionsPeriod,
    avgDailyRate,
    bestPerformingHabit,
    weakestHabit,
    dailyTrends,
    categoryBreakdown,
    habitComparisons,
    weeklyPerformance,
  };
}

function calculateConsistencyScore(habitStats) {
  if (!habitStats.length) return 0;
  const avgRate = habitStats.reduce((sum, h) => sum + h.completionRate, 0) / habitStats.length;
  const maxStreak = Math.max(0, ...habitStats.map((h) => h.streak));
  const streakBonus = Math.min(15, maxStreak * 2);
  return Math.min(100, Math.round(avgRate * 0.85 + streakBonus));
}

async function getDailyTrends(userId, days) {
  const trends = [];
  const habitsCount = await Habit.countDocuments({ userId, isArchived: false });

  for (let i = days - 1; i >= 0; i--) {
    const dateStr = getPastDateStr(i);
    const count = await HabitCompletion.countDocuments({ userId, date: dateStr });
    const rate = habitsCount > 0 ? Math.min(100, Math.round((count / habitsCount) * 100)) : 0;

    trends.push({
      date: dateStr,
      completionRate: rate,
      totalCompleted: count,
      totalHabits: habitsCount,
    });
  }

  return trends;
}

function getCategoryBreakdown(habitStats) {
  const categoryMap = {};

  habitStats.forEach((h) => {
    if (!categoryMap[h.category]) {
      categoryMap[h.category] = {
        category: h.category,
        count: 0,
        rateSum: 0,
        color: h.color || '#6366f1',
      };
    }
    categoryMap[h.category].count++;
    categoryMap[h.category].rateSum += h.completionRate;
  });

  return Object.values(categoryMap).map((cat) => ({
    category: cat.category,
    count: cat.count,
    completionRate: Math.round(cat.rateSum / cat.count),
    color: cat.color,
  }));
}

async function getWeeklyPerformance(userId, days) {
  const weeksCount = Math.max(1, Math.ceil(days / 7));
  const weeks = [];

  for (let w = weeksCount - 1; w >= 0; w--) {
    const startDaysAgo = (w + 1) * 7;
    const endDaysAgo = w * 7;
    const startDate = getPastDateStr(startDaysAgo);
    const endDate = getPastDateStr(endDaysAgo);

    const count = await HabitCompletion.countDocuments({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const habitsCount = await Habit.countDocuments({ userId, isArchived: false });
    const possibleCompletions = habitsCount * 7;
    const rate = possibleCompletions > 0 ? Math.min(100, Math.round((count / possibleCompletions) * 100)) : 0;

    weeks.push({
      week: `Week ${weeksCount - w}`,
      rate,
    });
  }

  return weeks;
}

function parseTimeRangeDays(rangeStr) {
  switch (rangeStr) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    case '6m':
      return 180;
    case '1y':
      return 365;
    default:
      return 30;
  }
}

module.exports = {
  getAnalyticsOverview,
};
