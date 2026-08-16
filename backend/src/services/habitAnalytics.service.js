const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const HabitMiss = require('../models/HabitMiss');
const { formatDate, getPastDateStr, daysDifference } = require('../utils/dates');

/**
 * Checks if a habit was scheduled on a given date.
 */
function isDateScheduled(habit, dateObj, dateStr) {
  if (habit.startDate && habit.startDate > dateStr) {
    return false;
  }

  const dayOfWeek = dateObj.getDay(); // 0=Sunday, 1=Monday ... 6=Saturday

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'specific_days':
    case 'custom':
      return Array.isArray(habit.customDays) && habit.customDays.includes(dayOfWeek);
    case 'weekly':
      return dayOfWeek === 1; // Default to Monday for weekly
    default:
      return true;
  }
}

/**
 * Calculates scheduled dates in a range.
 */
function getScheduledDatesInRange(habit, startDateStr, endDateStr) {
  const dates = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const curr = new Date(start);
  while (curr <= end) {
    const dStr = formatDate(curr);
    if (isDateScheduled(habit, curr, dStr)) {
      dates.push(dStr);
    }
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

/**
 * Schedule-aware current streak & longest streak calculation.
 */
function calculateScheduleAwareStreaks(habit, completionDateSet, todayStr) {
  const start = new Date(habit.startDate || getPastDateStr(90));
  const end = new Date(todayStr);

  // Collect all scheduled dates in chronological order
  const scheduledDates = [];
  const curr = new Date(start);
  while (curr <= end) {
    const dStr = formatDate(curr);
    if (isDateScheduled(habit, curr, dStr)) {
      scheduledDates.push(dStr);
    }
    curr.setDate(curr.getDate() + 1);
  }

  if (scheduledDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Calculate current streak (backwards from most recent scheduled occurrence)
  let currentStreak = 0;
  const reversedDates = [...scheduledDates].reverse();

  // If today is scheduled and not completed yet, allow yesterday's completion to maintain streak
  let checkStartIndex = 0;
  if (reversedDates[0] === todayStr && !completionDateSet.has(todayStr)) {
    checkStartIndex = 1;
  }

  for (let i = checkStartIndex; i < reversedDates.length; i++) {
    const dStr = reversedDates[i];
    if (completionDateSet.has(dStr)) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak historically
  let longestStreak = 0;
  let running = 0;
  for (const dStr of scheduledDates) {
    if (completionDateSet.has(dStr)) {
      running++;
      if (running > longestStreak) {
        longestStreak = running;
      }
    } else {
      running = 0;
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Infers best completion time from actual timestamps.
 */
function inferBestTime(completions, preferredTime) {
  const timestamped = completions.filter((c) => c.completedAt);
  if (timestamped.length < 3) {
    return preferredTime || 'Building baseline...';
  }

  // Aggregate completion minutes past midnight
  const minutesList = timestamped.map((c) => {
    const date = new Date(c.completedAt);
    return date.getHours() * 60 + date.getMinutes();
  });

  const avgMinutes = Math.round(minutesList.reduce((a, b) => a + b, 0) / minutesList.length);
  const hour = Math.floor(avgMinutes / 60);
  const mins = avgMinutes % 60;

  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMins = String(mins).padStart(2, '0');

  return `${displayHour}:${displayMins} ${period}`;
}

/**
 * Calculates Friction rating from misses and completion rate.
 */
function calculateFrictionRating(completionRate, missCount) {
  if (completionRate >= 80 && missCount <= 1) return 'LOW';
  if (completionRate >= 50 && missCount <= 4) return 'MEDIUM';
  return 'HIGH';
}

/**
 * Calculates Stability Risk level and Trend.
 */
function calculateStabilityRisk(recent14Rate, prior14Rate) {
  const trend = Math.round(recent14Rate - prior14Rate);

  let riskLevel = 'STABLE';
  if (recent14Rate < 40 || trend <= -25) {
    riskLevel = 'HIGH_RISK';
  } else if (recent14Rate < 60 || trend <= -12) {
    riskLevel = 'AT_RISK';
  } else if (recent14Rate < 75 || trend < 0) {
    riskLevel = 'WATCH';
  }

  return { riskLevel, trend };
}

/**
 * Main function to compute full detailed analytics for a habit.
 */
async function getHabitDetailedAnalytics(habitId, userId) {
  const habit = await Habit.findOne({ _id: habitId, userId }).lean();
  if (!habit) {
    throw new Error('Habit not found');
  }

  const todayStr = formatDate(new Date());
  const startDateStr = habit.startDate || getPastDateStr(30);

  // Fetch all completions for this habit
  const completions = await HabitCompletion.find({ habitId, userId }).sort({ date: 1 }).lean();
  const completionDates = completions.map((c) => c.date);
  const completionDateSet = new Set(completionDates);

  // Fetch all miss records
  const misses = await HabitMiss.find({ habitId, userId }).sort({ date: -1 }).lean();

  // Schedule occurrences
  const allScheduled = getScheduledDatesInRange(habit, startDateStr, todayStr);
  const totalScheduled = allScheduled.length;
  const totalCompleted = completions.length;
  const totalMissed = Math.max(0, totalScheduled - totalCompleted);

  // Reliability (All-time scheduled vs completed)
  const reliability =
    totalScheduled > 0 ? Math.min(100, Math.round((totalCompleted / totalScheduled) * 100)) : 80;

  // Streaks
  const { currentStreak, longestStreak } = calculateScheduleAwareStreaks(habit, completionDateSet, todayStr);

  // Recent 14d and prior 14d for trend calculation
  const last14Scheduled = getScheduledDatesInRange(habit, getPastDateStr(13), todayStr);
  const prior14Scheduled = getScheduledDatesInRange(habit, getPastDateStr(27), getPastDateStr(14));

  const recent14Completed = last14Scheduled.filter((d) => completionDateSet.has(d)).length;
  const prior14Completed = prior14Scheduled.filter((d) => completionDateSet.has(d)).length;

  const recent14Rate =
    last14Scheduled.length > 0 ? Math.round((recent14Completed / last14Scheduled.length) * 100) : reliability;
  const prior14Rate =
    prior14Scheduled.length > 0 ? Math.round((prior14Completed / prior14Scheduled.length) * 100) : reliability;

  // Consistency & Progress
  const consistency = recent14Rate;
  const progress =
    totalScheduled > 0 ? Math.min(100, Math.round((totalCompleted / totalScheduled) * 100)) : 80;

  // Best Time
  const bestTime = inferBestTime(completions, habit.preferredTime);

  // Friction
  const friction = calculateFrictionRating(reliability, misses.length);

  // Stability Risk
  const { riskLevel, trend: stabilityTrend } = calculateStabilityRisk(recent14Rate, prior14Rate);

  // Miss reasons aggregation
  const reasonsMap = {};
  misses.forEach((m) => {
    reasonsMap[m.reason] = (reasonsMap[m.reason] || 0) + 1;
  });

  const missReasons = Object.entries(reasonsMap).map(([reason, count]) => ({
    reason,
    count,
    percentage: misses.length > 0 ? Math.round((count / misses.length) * 100) : 0,
  }));

  // AI Suggestion
  let aiSuggestion = null;
  if (totalCompleted >= 3) {
    if (habit.preferredTime) {
      aiSuggestion = `Based on your routine patterns, completing "${habit.name}" near ${habit.preferredTime} yields your highest completion stability.`;
    } else {
      aiSuggestion = `Your consistency for "${habit.name}" is compounding at ${reliability}% reliability. Protect your ${currentStreak}-day streak to build automaticity.`;
    }
  } else {
    aiSuggestion = 'Complete this habit for a few more days to unlock personalized behavioral recommendations.';
  }

  // Daily Trend (Last 14 days)
  const dailyTrend = [];
  for (let i = 13; i >= 0; i--) {
    const dStr = getPastDateStr(i);
    const scheduled = isDateScheduled(habit, new Date(dStr), dStr);
    const completed = completionDateSet.has(dStr);
    dailyTrend.push({
      date: dStr,
      scheduled,
      completed,
    });
  }

  return {
    habitId: habit._id.toString(),
    name: habit.name,
    category: habit.category,
    trackingType: habit.trackingType || 'binary',
    targetValue: habit.targetValue || 1,
    unit: habit.unit || 'times',
    preferredTime: habit.preferredTime || '',
    difficulty: habit.difficulty || 'moderate',
    expectedFriction: habit.expectedFriction || 'medium',
    reliability,
    consistency,
    currentStreak,
    longestStreak,
    progress,
    friction,
    stabilityRisk: riskLevel,
    stabilityTrend,
    bestTime,
    totalScheduled,
    totalCompleted,
    totalMissed,
    completionRate: reliability,
    missReasons,
    dailyTrend,
    aiSuggestion,
  };
}

module.exports = {
  isDateScheduled,
  getScheduledDatesInRange,
  calculateScheduleAwareStreaks,
  inferBestTime,
  calculateFrictionRating,
  calculateStabilityRisk,
  getHabitDetailedAnalytics,
};
