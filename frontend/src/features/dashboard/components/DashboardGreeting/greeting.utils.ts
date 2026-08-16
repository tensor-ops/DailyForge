import { GreetingContext, TimeGreetingResult, TimeOfDay } from './greeting.types';

/**
 * Normalizes user's full name to a clean, properly capitalized first name.
 * e.g. "PARTH AGRAWAL" -> "Parth", "parth" -> "Parth", undefined -> "Parth"
 */
export const formatFirstName = (rawName?: string | null): string => {
  if (!rawName || !rawName.trim()) {
    return 'Parth';
  }

  const firstWord = rawName.trim().split(/\s+/)[0];
  if (!firstWord) return 'Parth';

  // Capitalize first character and lowercase the rest for elegant casing
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
};

/**
 * Returns time-of-day specific greeting title, default subtitle, and time slot.
 * Ensures at most one meaningful emoji is used.
 */
export const getTimeGreeting = (name: string, date = new Date()): TimeGreetingResult => {
  const hour = date.getHours();

  let timeOfDay: TimeOfDay;
  let title: string;
  let defaultSubtitle: string;

  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
    title = `Good morning, ${name}. ☀️`;
    defaultSubtitle = "A new day. Let's build something consistent.";
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
    title = `Good afternoon, ${name}. 👋`;
    defaultSubtitle = "Keep the momentum moving.";
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'evening';
    title = `Good evening, ${name}. 🌙`;
    defaultSubtitle = "Finish strong. Protect today's momentum.";
  } else {
    timeOfDay = 'night';
    title = `Welcome back, ${name}. 🌙`;
    defaultSubtitle = "Close the day strong.";
  }

  return { title, defaultSubtitle, timeOfDay };
};

/**
 * Derives an intelligent subtitle from the user's real-time progress, streak, and momentum.
 * Applies a strict priority hierarchy.
 */
export const getIntelligentSubtitle = (
  context: GreetingContext,
  defaultSubtitle: string
): string => {
  const { habits, currentStreak, momentumScore, behaviorData } = context;

  const totalCount = habits.length;
  const completedCount = habits.filter((h) => h.completedToday).length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const streak = currentStreak ?? (behaviorData?.habitReliability?.length
    ? behaviorData.habitReliability.reduce((max, h) => Math.max(max, h.streak), 0)
    : 0);
  const momentum = momentumScore ?? behaviorData?.momentum?.score;

  // 1. Perfect day (100% completed)
  if (totalCount > 0 && completedCount === totalCount) {
    return "Perfect execution today. That's consistency in action.";
  }

  // 2. Strong streak milestone (streak >= 14)
  if (streak >= 14) {
    return `${streak} days strong. Your consistency is becoming a habit.`;
  }

  // 3. High momentum (>= 80)
  if (typeof momentum === 'number' && momentum >= 80) {
    return "Your momentum is strong. Keep it moving.";
  }

  // 4. Strong daily progress (>= 80%)
  if (totalCount > 0 && completionRate >= 80) {
    return "You're on a roll. Keep the momentum going.";
  }

  // 5. Good daily progress (50% - 79%)
  if (totalCount > 0 && completionRate >= 50) {
    return "You're making solid progress. Keep forging ahead.";
  }

  // 6. Weak day (< 50% and some habits left)
  if (totalCount > 0 && completionRate < 50 && completedCount > 0) {
    return "There's still time to turn today around.";
  }

  // 7. Low momentum (< 50 and > 0)
  if (typeof momentum === 'number' && momentum > 0 && momentum < 50) {
    return "Momentum is built one action at a time. Start with one.";
  }

  // 8. Fallback to time-based subtitle
  return defaultSubtitle;
};

/**
 * Extracts a single genuine, data-backed behavioral micro-insight.
 * Returns null if real historical data is not present (avoids fake insights).
 */
export const getBehavioralMicroInsight = (context: GreetingContext): string | null => {
  const { behaviorData, habits, currentStreak } = context;

  // 1. Check Peak Performance Windows from real behavior analytics
  if (behaviorData?.peakWindows && behaviorData.peakWindows.length > 0) {
    const topWindow = behaviorData.peakWindows[0];
    if (topWindow.window) {
      return `You're strongest between ${topWindow.window}.`;
    }
  }

  // 2. Check fingerprint peak hours
  if (behaviorData?.fingerprint?.peakPerformanceHours) {
    return `You're strongest during ${behaviorData.fingerprint.peakPerformanceHours}.`;
  }

  // 3. Check Consistency Change improvement
  if (behaviorData?.consistencyChange && behaviorData.consistencyChange > 0) {
    return `You've improved your consistency by ${Math.round(behaviorData.consistencyChange)}% this month.`;
  }

  // 4. Check proximity to personal-best streak
  if (habits && habits.length > 0) {
    const maxLongest = habits.reduce((max, h) => Math.max(max, h.longestStreak || 0), 0);
    const activeStreak = currentStreak || 0;
    const diff = maxLongest - activeStreak;
    if (diff > 0 && diff <= 14 && activeStreak > 3) {
      return `You're ${diff} day${diff === 1 ? '' : 's'} away from your personal-best streak.`;
    }
  }

  return null;
};
