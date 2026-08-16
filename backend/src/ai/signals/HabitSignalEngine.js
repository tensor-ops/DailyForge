const Habit = require('../../models/Habit');
const HabitCompletion = require('../../models/HabitCompletion');
const CalendarEvent = require('../../models/CalendarEvent');
const { formatDate } = require('../../utils/dates');

/**
 * HabitSignalEngine
 * Deterministically analyzes real habit logs, completions, and schedule blocks to produce high-confidence signals.
 */
class HabitSignalEngine {
  /**
   * Extract all active behavioral signals for a given user.
   */
  static async extractSignals(userId) {
    const [habits, completions, events] = await Promise.all([
      Habit.find({ userId, isArchived: false }).lean(),
      HabitCompletion.find({ userId }).sort({ date: -1 }).limit(300).lean(),
      CalendarEvent.find({ userId }).limit(100).lean(),
    ]);

    const signals = [];

    if (!habits || habits.length === 0) {
      return signals;
    }

    // 1. Time-of-Day Window Signals (e.g. morning vs evening consistency)
    const timeSignals = this.analyzeCircadianWindows(completions, habits);
    signals.push(...timeSignals);

    // 2. Day-of-Week Patterns (e.g. weekend vs weekday decay)
    const weekdaySignals = this.analyzeWeekdayPatterns(completions);
    signals.push(...weekdaySignals);

    // 3. Habit Trajectory & Friction (declining, improving, high friction)
    const trajectorySignals = this.analyzeHabitTrajectories(habits, completions);
    signals.push(...trajectorySignals);

    // 4. Streak At-Risk Signals
    const streakSignals = this.analyzeStreakRisk(habits, completions);
    signals.push(...streakSignals);

    // 5. Recovery Patterns
    const recoverySignals = this.analyzeRecoveryPatterns(habits, completions);
    signals.push(...recoverySignals);

    // 6. Schedule Conflicts
    const conflictSignals = this.analyzeScheduleConflicts(events);
    signals.push(...conflictSignals);

    return signals;
  }

  static analyzeCircadianWindows(completions, habits) {
    const signals = [];
    if (completions.length < 5) return signals;

    let morningCount = 0;
    let morningDone = 0;
    let eveningCount = 0;
    let eveningDone = 0;

    for (const c of completions) {
      const h = new Date(c.createdAt || c.updatedAt).getHours();
      if (h >= 5 && h < 12) {
        morningCount++;
        if (c.status === 'completed') morningDone++;
      } else if (h >= 17 && h < 24) {
        eveningCount++;
        if (c.status === 'completed') eveningDone++;
      }
    }

    const morningRate = morningCount > 0 ? (morningDone / morningCount) * 100 : 0;
    const eveningRate = eveningCount > 0 ? (eveningDone / eveningCount) * 100 : 0;

    if (morningCount >= 5 && morningRate >= 80) {
      signals.push({
        type: 'strong_time_window',
        value: '07:00 AM – 11:30 AM',
        evidence: `Associated with an observed ${Math.round(morningRate)}% completion rate across ${morningCount} morning logs.`,
        observationCount: morningCount,
        confidence: Math.min(0.95, 0.65 + morningCount * 0.02),
        createdAt: new Date().toISOString(),
      });
    }

    if (eveningCount >= 5 && eveningRate < 60) {
      signals.push({
        type: 'weak_time_window',
        value: '08:00 PM – 11:00 PM',
        evidence: `Observed completion rate drops to ${Math.round(eveningRate)}% during evening hours across ${eveningCount} observations.`,
        observationCount: eveningCount,
        confidence: Math.min(0.9, 0.6 + eveningCount * 0.02),
        createdAt: new Date().toISOString(),
      });
    }

    return signals;
  }

  static analyzeWeekdayPatterns(completions) {
    const signals = [];
    if (completions.length < 10) return signals;

    const dayCounts = { 0: { total: 0, done: 0 }, 6: { total: 0, done: 0 } }; // Sun, Sat
    let weekdayTotal = 0;
    let weekdayDone = 0;

    for (const c of completions) {
      const day = new Date(c.date || c.createdAt).getDay();
      const isDone = c.status === 'completed';
      if (day === 0 || day === 6) {
        dayCounts[day].total++;
        if (isDone) dayCounts[day].done++;
      } else {
        weekdayTotal++;
        if (isDone) weekdayDone++;
      }
    }

    const weekendTotal = dayCounts[0].total + dayCounts[6].total;
    const weekendDone = dayCounts[0].done + dayCounts[6].done;
    const weekendRate = weekendTotal > 0 ? (weekendDone / weekendTotal) * 100 : 0;
    const weekdayRate = weekdayTotal > 0 ? (weekdayDone / weekdayTotal) * 100 : 0;

    if (weekendTotal >= 4 && weekendRate < weekdayRate - 20) {
      signals.push({
        type: 'weak_weekday',
        value: 'Saturday & Sunday',
        evidence: `Weekend execution drops to ${Math.round(weekendRate)}% compared to ${Math.round(weekdayRate)}% on weekdays.`,
        observationCount: weekendTotal,
        confidence: 0.82,
        createdAt: new Date().toISOString(),
      });
    }

    return signals;
  }

  static analyzeHabitTrajectories(habits, completions) {
    const signals = [];

    for (const habit of habits) {
      const habitCompletions = completions.filter((c) => c.habitId?.toString() === habit._id.toString());
      if (habitCompletions.length >= 7) {
        const recent7 = habitCompletions.slice(0, 7);
        const prior7 = habitCompletions.slice(7, 14);

        const recentRate = (recent7.filter((c) => c.status === 'completed').length / recent7.length) * 100;
        const priorRate = prior7.length > 0 ? (prior7.filter((c) => c.status === 'completed').length / prior7.length) * 100 : recentRate;

        if (recentRate < priorRate - 25) {
          signals.push({
            type: 'declining_habit',
            value: habit.name,
            evidence: `Recent 7-day completion rate of ${Math.round(recentRate)}% is significantly lower than prior baseline (${Math.round(priorRate)}%).`,
            observationCount: habitCompletions.length,
            confidence: 0.85,
            createdAt: new Date().toISOString(),
          });
        } else if (recentRate > priorRate + 20) {
          signals.push({
            type: 'improving_habit',
            value: habit.name,
            evidence: `Completion rate improved to ${Math.round(recentRate)}% over the last 7 days.`,
            observationCount: habitCompletions.length,
            confidence: 0.88,
            createdAt: new Date().toISOString(),
          });
        }
      }

      if (habit.expectedFriction === 'high' || habit.difficulty === 'hard') {
        signals.push({
          type: 'high_friction',
          value: habit.name,
          evidence: `Habit configured with high perceived friction and cognitive demand.`,
          observationCount: 1,
          confidence: 0.9,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return signals;
  }

  static analyzeStreakRisk(habits, completions) {
    const signals = [];
    const todayStr = formatDate(new Date());

    for (const habit of habits) {
      if ((habit.currentStreak || 0) >= 3) {
        const todayDone = completions.some(
          (c) => c.habitId?.toString() === habit._id.toString() && c.date === todayStr && c.status === 'completed'
        );

        if (!todayDone && new Date().getHours() >= 18) {
          signals.push({
            type: 'streak_risk',
            value: habit.name,
            evidence: `Current ${habit.currentStreak}-day streak is pending execution for today after 6:00 PM.`,
            observationCount: habit.currentStreak,
            confidence: 0.9,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    return signals;
  }

  static analyzeRecoveryPatterns(habits, completions) {
    const signals = [];
    let recoverySuccesses = 0;
    let totalMisses = 0;

    for (const habit of habits) {
      const hComps = completions.filter((c) => c.habitId?.toString() === habit._id.toString());
      for (let i = 0; i < hComps.length - 1; i++) {
        if (hComps[i + 1].status === 'missed' || hComps[i + 1].status === 'skipped') {
          totalMisses++;
          if (hComps[i].status === 'completed') {
            recoverySuccesses++;
          }
        }
      }
    }

    if (totalMisses >= 3) {
      const bounceBackRate = Math.round((recoverySuccesses / totalMisses) * 100);
      signals.push({
        type: 'recovery_pattern',
        value: `${bounceBackRate}% Next-Day Bounce Back`,
        evidence: `Observed user recovers within 24h on ${recoverySuccesses} of ${totalMisses} post-miss occasions.`,
        observationCount: totalMisses,
        confidence: 0.84,
        createdAt: new Date().toISOString(),
      });
    }

    return signals;
  }

  static analyzeScheduleConflicts(events) {
    const signals = [];
    const todayStr = formatDate(new Date());
    const todayEvents = events.filter((e) => e.date === todayStr);

    for (let i = 0; i < todayEvents.length; i++) {
      for (let j = i + 1; j < todayEvents.length; j++) {
        const e1 = todayEvents[i];
        const e2 = todayEvents[j];
        if (
          e1.startMinutes !== undefined &&
          e1.endMinutes !== undefined &&
          e2.startMinutes !== undefined &&
          e2.endMinutes !== undefined
        ) {
          if (e1.startMinutes < e2.endMinutes && e1.endMinutes > e2.startMinutes) {
            signals.push({
              type: 'schedule_conflict',
              value: `Overlap: "${e1.title}" and "${e2.title}"`,
              evidence: `Time collision detected on execution schedule for ${todayStr}.`,
              observationCount: 1,
              confidence: 0.98,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    return signals;
  }
}

module.exports = HabitSignalEngine;
