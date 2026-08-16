const { formatDate } = require('../utils/dates');

const SPARK_LIBRARY = {
  STRONG_STREAK: [
    {
      text: "Don't protect the streak. Protect the person you're becoming.",
      category: 'DISCIPLINE',
    },
    {
      text: 'Consistency is not a test to pass. It is a posture to maintain.',
      category: 'CONSISTENCY',
    },
    {
      text: 'Automaticity happens quietly. Every repeat cements the identity.',
      category: 'GROWTH',
    },
    {
      text: 'When a habit becomes your baseline, excellence becomes natural.',
      category: 'MASTERY',
    },
  ],
  STREAK_AT_RISK: [
    {
      text: 'Your streak is a number. Your commitment is the real achievement.',
      category: 'SELF_TRUST',
    },
    {
      text: 'One action is enough to keep moving. Small steps protect great momentum.',
      category: 'COURAGE',
    },
    {
      text: 'The hardest part is the decision to start. Lower the barrier and execute.',
      category: 'DISCIPLINE',
    },
  ],
  MOMENTUM_BUILDING: [
    {
      text: 'Momentum compounds when you show up on the ordinary days.',
      category: 'MOMENTUM',
    },
    {
      text: 'Energy follows action, not the other way around. Keep the rhythm.',
      category: 'MOMENTUM',
    },
    {
      text: 'You are not starting from scratch today; you are building on every yesterday.',
      category: 'GROWTH',
    },
  ],
  LOW_MOMENTUM: [
    {
      text: "Momentum doesn't disappear. It waits for the next small action.",
      category: 'RECOVERY',
    },
    {
      text: "Don't wait for ideal conditions. Take one low-friction step today.",
      category: 'ACTION',
    },
    {
      text: 'Start with one. Rhythm returns the moment you move.',
      category: 'MOMENTUM',
    },
  ],
  CONSISTENCY_IMPROVING: [
    {
      text: 'Small improvements become remarkable when you repeat them long enough.',
      category: 'CONSISTENCY',
    },
    {
      text: 'Progress is rarely loud. It is steady, patient, and quiet.',
      category: 'PATIENCE',
    },
    {
      text: "Today's consistency becomes tomorrow's baseline confidence.",
      category: 'CONFIDENCE',
    },
  ],
  RECOVERY: [
    {
      text: 'A bad stretch is information, not a verdict. Reset and begin again.',
      category: 'RECOVERY',
    },
    {
      text: 'Coming back is part of consistency. Never measure yourself by a single missed day.',
      category: 'REFLECTION',
    },
    {
      text: "You don't need a perfect record. You need another good decision.",
      category: 'SELF_TRUST',
    },
  ],
  NEW_USER: [
    {
      text: "Don't try to change everything. Build one thing you can repeat.",
      category: 'DISCIPLINE',
    },
    {
      text: 'Start with one small promise you can keep today.',
      category: 'START',
    },
    {
      text: 'Simplicity is the secret to habits that survive real life.',
      category: 'FOCUS',
    },
  ],
  MILESTONE: [
    {
      text: 'Milestones are proof that small actions compound into real growth.',
      category: 'MILESTONE',
    },
    {
      text: 'Celebrate the milestone, but honor the daily practice that forged it.',
      category: 'REFLECTION',
    },
  ],
  NEUTRAL: [
    {
      text: "Consistency is built on the days when motivation doesn't show up.",
      category: 'CONSISTENCY',
    },
    {
      text: 'Small actions become powerful when they become ordinary.',
      category: 'FOCUS',
    },
    {
      text: 'Discipline is choosing what matters most over what feels easy now.',
      category: 'DISCIPLINE',
    },
    {
      text: 'Focus on the reps. The compounding takes care of itself.',
      category: 'GROWTH',
    },
    {
      text: 'Great routines fit your life, not the other way around.',
      category: 'BALANCE',
    },
  ],
};

/**
 * Classifies user state deterministically from telemetry.
 */
function classifyUserState(habits = [], behaviorData = null, now = new Date()) {
  const activeHabits = habits.filter((h) => !h.isArchived);

  // New user check: 0 active habits, or 1 habit with 0-1 streak and no history
  const isBrandNew =
    activeHabits.length === 0 ||
    (activeHabits.length === 1 &&
      (activeHabits[0].currentStreak || 0) <= 1 &&
      (!behaviorData || (behaviorData.executionRate?.total || 0) < 3));

  if (isBrandNew) {
    return 'NEW_USER';
  }

  const maxStreak = activeHabits.reduce((max, h) => Math.max(max, h.currentStreak || 0), 0);
  const currentHour = now.getHours();
  const hasIncompleteActiveStreak = activeHabits.some(
    (h) => (h.currentStreak || 0) >= 3 && !h.completedToday
  );

  // Streak at risk in evening
  if (hasIncompleteActiveStreak && currentHour >= 17) {
    return 'STREAK_AT_RISK';
  }

  // Strong streak
  if (maxStreak >= 14) {
    return 'STRONG_STREAK';
  }

  // Behavior comparisons
  if (behaviorData && behaviorData.comparison) {
    const consistencyDelta = behaviorData.comparison.consistencyChange || 0;
    const momentumDelta = behaviorData.comparison.momentumChange || 0;

    if (consistencyDelta >= 8) return 'CONSISTENCY_IMPROVING';
    if (consistencyDelta <= -8) return 'RECOVERY';
    if (momentumDelta >= 10) return 'MOMENTUM_BUILDING';
    if (momentumDelta <= -10) return 'LOW_MOMENTUM';
  }

  // Check at-risk habits
  const atRiskCount = behaviorData?.habitRisk?.filter((r) => r.riskLevel === 'HIGH').length || 0;
  if (atRiskCount > 0) {
    return 'RECOVERY';
  }

  return 'NEUTRAL';
}

/**
 * Generates the single Daily Forge Spark for a given user and calendar date.
 */
function generateDailySparkNotification(userId, habits = [], behaviorData = null, now = new Date()) {
  const todayStr = formatDate(now);
  const userState = classifyUserState(habits, behaviorData, now);

  const quotePool = SPARK_LIBRARY[userState] || SPARK_LIBRARY.NEUTRAL;

  // Deterministic rotation based on day of year to prevent repeats
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const selectedQuote = quotePool[dayOfYear % quotePool.length];

  const maxStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak || 0), 0);
  const consistencyScore = behaviorData?.consistencyScore || 80;
  const momentumScore = behaviorData?.momentumScore || 80;

  return {
    userId,
    type: 'DAILY_SPARK',
    priority: 'NORMAL',
    title: '🔥 Daily Forge Spark',
    message: `"${selectedQuote.text}"`,
    entityType: 'system',
    actionUrl: '/dashboard',
    metadata: {
      category: selectedQuote.category,
      contextState: userState,
      attribution: 'Daily Forge',
      streak: maxStreak,
      consistency: consistencyScore,
      momentum: momentumScore,
      date: todayStr,
    },
    dedupKey: `DAILY_SPARK:${userId}:${todayStr}`,
  };
}

module.exports = {
  SPARK_LIBRARY,
  classifyUserState,
  generateDailySparkNotification,
};
