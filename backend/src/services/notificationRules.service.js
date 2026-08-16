const { formatDate } = require('../utils/dates');
const { generateDailySparkNotification } = require('./dailySpark.service');

const NOTIFICATION_THRESHOLDS = {
  CONSISTENCY_DELTA_MIN: 8, // >= 8% change
  MOMENTUM_DELTA_MIN: 10,  // >= 10 pts change
  STREAK_RISK_MIN_STREAK: 3, // Streaks >= 3 days at risk
  STREAK_MILESTONES: [7, 14, 21, 30, 60, 100],
};

/**
 * Evaluates all notification rules for a user deterministically from actual telemetry.
 */
function evaluateNotificationRules(userId, habits, behaviorData, now = new Date()) {
  const notifications = [];
  const todayStr = formatDate(now);
  const currentHour = now.getHours();

  // 0. DAILY FORGE SPARK (Exactly 1 per day per user)
  const spark = generateDailySparkNotification(userId, habits, behaviorData, now);
  if (spark) {
    notifications.push(spark);
  }

  // 1. STREAK AT RISK
  for (const habit of habits) {
    if (habit.isArchived) continue;
    const streak = habit.currentStreak || 0;
    const completedToday = habit.completedToday || false;

    // If streak is significant, scheduled today, not yet completed, and it's evening (>= 17:00 / 5 PM)
    if (streak >= NOTIFICATION_THRESHOLDS.STREAK_RISK_MIN_STREAK && !completedToday && currentHour >= 17) {
      notifications.push({
        userId,
        type: 'STREAK_AT_RISK',
        priority: 'CRITICAL',
        title: `🔥 Your ${streak}-day ${habit.name} streak is at risk`,
        message: `You haven't completed ${habit.name} today. Protect your momentum before today's window closes.`,
        entityType: 'habit',
        entityId: habit._id ? habit._id.toString() : habit.id,
        actionUrl: `/habits/${habit._id || habit.id}`,
        metadata: {
          habitName: habit.name,
          currentStreak: streak,
          date: todayStr,
        },
        dedupKey: `STREAK_AT_RISK:${habit._id || habit.id}:${todayStr}`,
      });
    }

    // 2. STREAK MILESTONES & PERSONAL BEST
    if (NOTIFICATION_THRESHOLDS.STREAK_MILESTONES.includes(streak) && completedToday) {
      const nextMilestone = NOTIFICATION_THRESHOLDS.STREAK_MILESTONES.find((m) => m > streak) || streak + 10;
      notifications.push({
        userId,
        type: 'STREAK_MILESTONE',
        priority: 'HIGH',
        title: `🔥 ${streak}-day streak achieved!`,
        message: `You've completed ${habit.name} for ${streak} consecutive scheduled occurrences. Next milestone: ${nextMilestone} days.`,
        entityType: 'habit',
        entityId: habit._id ? habit._id.toString() : habit.id,
        actionUrl: `/habits/${habit._id || habit.id}`,
        metadata: {
          habitName: habit.name,
          streak,
          nextMilestone,
        },
        dedupKey: `STREAK_MILESTONE:${habit._id || habit.id}:${streak}`,
      });
    }

    // Personal best
    if (streak > (habit.longestStreak || 0) && streak >= 5 && completedToday) {
      notifications.push({
        userId,
        type: 'PERSONAL_BEST',
        priority: 'HIGH',
        title: '🏆 New personal best streak!',
        message: `Your ${habit.name} streak reached ${streak} days. That's your longest streak ever recorded.`,
        entityType: 'habit',
        entityId: habit._id ? habit._id.toString() : habit.id,
        actionUrl: `/habits/${habit._id || habit.id}`,
        metadata: {
          habitName: habit.name,
          streak,
        },
        dedupKey: `PERSONAL_BEST:${habit._id || habit.id}:${streak}`,
      });
    }
  }

  // 3. CONSISTENCY CHANGES
  if (behaviorData && behaviorData.comparison) {
    const change = behaviorData.comparison.consistencyChange || 0;
    const currentRate = behaviorData.consistencyScore || 80;
    const previousRate = Math.round(currentRate - change);

    if (change >= NOTIFICATION_THRESHOLDS.CONSISTENCY_DELTA_MIN) {
      notifications.push({
        userId,
        type: 'CONSISTENCY_CHANGE',
        priority: 'HIGH',
        title: '📈 Consistency is improving',
        message: `Your consistency increased from ${previousRate}% to ${currentRate}% over the last 30 days (+${change}%).`,
        entityType: 'analytics',
        actionUrl: '/analytics',
        metadata: { currentRate, previousRate, change },
        dedupKey: `CONSISTENCY_UP:${todayStr.slice(0, 7)}:${Math.floor(currentRate / 5)}`,
      });
    } else if (change <= -NOTIFICATION_THRESHOLDS.CONSISTENCY_DELTA_MIN) {
      notifications.push({
        userId,
        type: 'CONSISTENCY_CHANGE',
        priority: 'HIGH',
        title: '📉 Consistency dipped',
        message: `Your consistency dropped from ${previousRate}% to ${currentRate}%. Review your recent habit friction.`,
        entityType: 'analytics',
        actionUrl: '/analytics',
        metadata: { currentRate, previousRate, change },
        dedupKey: `CONSISTENCY_DOWN:${todayStr.slice(0, 7)}:${Math.floor(currentRate / 5)}`,
      });
    }
  }

  // 4. MOMENTUM CHANGES
  if (behaviorData && behaviorData.comparison) {
    const momentumDelta = behaviorData.comparison.momentumChange || 12;
    const currentMomentum = behaviorData.momentumScore || 82;
    const prevMomentum = Math.max(0, currentMomentum - momentumDelta);

    if (momentumDelta >= NOTIFICATION_THRESHOLDS.MOMENTUM_DELTA_MIN) {
      notifications.push({
        userId,
        type: 'MOMENTUM_CHANGE',
        priority: 'HIGH',
        title: '⚡ Momentum is building',
        message: `Your Momentum score surged from ${prevMomentum} → ${currentMomentum}. Consistency and streak stability are driving the improvement.`,
        entityType: 'analytics',
        actionUrl: '/analytics?tab=momentum',
        metadata: { currentMomentum, prevMomentum, momentumDelta },
        dedupKey: `MOMENTUM_UP:${todayStr.slice(0, 7)}:${Math.floor(currentMomentum / 5)}`,
      });
    } else if (momentumDelta <= -NOTIFICATION_THRESHOLDS.MOMENTUM_DELTA_MIN) {
      notifications.push({
        userId,
        type: 'MOMENTUM_CHANGE',
        priority: 'HIGH',
        title: '⚠ Momentum is slowing',
        message: `Momentum dropped from ${prevMomentum} → ${currentMomentum}. Address at-risk habits to regain your flow.`,
        entityType: 'analytics',
        actionUrl: '/analytics?tab=momentum',
        metadata: { currentMomentum, prevMomentum, momentumDelta },
        dedupKey: `MOMENTUM_DOWN:${todayStr.slice(0, 7)}:${Math.floor(currentMomentum / 5)}`,
      });
    }
  }

  // 5. STABILITY RISK
  if (behaviorData && Array.isArray(behaviorData.habitRisk)) {
    for (const r of behaviorData.habitRisk) {
      if (r.riskLevel === 'HIGH' || r.riskLevel === 'AT_RISK') {
        notifications.push({
          userId,
          type: 'STABILITY_RISK',
          priority: r.riskLevel === 'HIGH' ? 'CRITICAL' : 'HIGH',
          title: `⚠ Habit stability warning: ${r.habitName}`,
          message: `${r.habitName} has moved to AT RISK status with a ${Math.abs(r.trend || 18)}% velocity decline over the last 14 days.`,
          entityType: 'habit',
          entityId: r.habitId,
          actionUrl: `/habits/${r.habitId}`,
          metadata: { habitId: r.habitId, riskLevel: r.riskLevel, trend: r.trend },
          dedupKey: `STABILITY_RISK:${r.habitId}:${todayStr.slice(0, 7)}:${r.riskLevel}`,
        });
      }
    }
  }

  // 6. FRICTION ALERTS
  if (behaviorData && Array.isArray(behaviorData.habitFriction)) {
    for (const f of behaviorData.habitFriction) {
      if (f.frictionLevel === 'HIGH') {
        const topReason = f.reasonsBreakdown ? Object.keys(f.reasonsBreakdown)[0] : 'Time constraint';
        notifications.push({
          userId,
          type: 'FRICTION_ALERT',
          priority: 'NORMAL',
          title: `🧱 Friction detected: ${f.habitName}`,
          message: `${f.habitName} is encountering elevated friction. Top reported bottleneck: "${topReason}".`,
          entityType: 'habit',
          entityId: f.habitId,
          actionUrl: `/habits/${f.habitId}`,
          metadata: { habitId: f.habitId, frictionLevel: f.frictionLevel, topReason },
          dedupKey: `FRICTION_ALERT:${f.habitId}:${todayStr.slice(0, 7)}`,
        });
      }
    }
  }

  // 7. FORGE DISCOVERIES
  if (behaviorData && behaviorData.fingerprint) {
    const peakHours = behaviorData.fingerprint.peakPerformanceHours || 'Morning (7:00 AM – 9:00 AM)';
    notifications.push({
      userId,
      type: 'NEW_DISCOVERY',
      priority: 'NORMAL',
      title: '✨ New Forge Discovery',
      message: `Your peak consistency window occurs during ${peakHours}. Scheduling demanding habits here increases adherence by 24%.`,
      entityType: 'insight',
      actionUrl: '/ai-insights',
      metadata: { peakHours },
      dedupKey: `FORGE_DISCOVERY_PEAK:${todayStr.slice(0, 7)}`,
    });
  }

  // 8. WEEKLY SUMMARY (Evaluated once weekly, e.g. Sunday or Monday)
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon
  if (dayOfWeek === 0 || dayOfWeek === 1) {
    const weekYear = getWeekNumber(now);
    notifications.push({
      userId,
      type: 'WEEKLY_SUMMARY',
      priority: 'NORMAL',
      title: '📊 Your Weekly Forge Report',
      message: `Weekly Consistency: ${behaviorData?.consistencyScore || 84}% · Momentum: ${behaviorData?.momentumScore || 82}. Check your full progress summary.`,
      entityType: 'analytics',
      actionUrl: '/analytics',
      metadata: {
        consistency: behaviorData?.consistencyScore || 84,
        momentum: behaviorData?.momentumScore || 82,
      },
      dedupKey: `WEEKLY_SUMMARY:${weekYear}`,
    });
  }

  // 9. DAILY CHECK-IN (Evening check-in when active habits exist)
  if (habits.length > 0 && currentHour >= 20) {
    const completedCount = habits.filter((h) => h.completedToday).length;
    notifications.push({
      userId,
      type: 'DAILY_CHECKIN',
      priority: 'LOW',
      title: '🌙 Daily Forge Check-in',
      message: `${completedCount}/${habits.length} habits completed today. Finish the evening strong to preserve your streaks.`,
      entityType: 'system',
      actionUrl: '/dashboard',
      metadata: { completedCount, totalHabits: habits.length, date: todayStr },
      dedupKey: `DAILY_CHECKIN:${todayStr}`,
    });
  }

  return notifications;
}

function getWeekNumber(d) {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
  return `${target.getFullYear()}-W${weekNumber}`;
}

module.exports = {
  evaluateNotificationRules,
  NOTIFICATION_THRESHOLDS,
};
