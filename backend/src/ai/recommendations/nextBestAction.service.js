const PersonalContextEngine = require('../context/PersonalContextEngine');
const Habit = require('../../models/Habit');
const CalendarEvent = require('../../models/CalendarEvent');
const HabitCompletion = require('../../models/HabitCompletion');
const { formatDate } = require('../../utils/dates');

class NextBestActionEngine {
  /**
   * Computes the 1–3 highest leverage next actions for the current moment.
   */
  static async computeNextActions(userId) {
    const todayStr = formatDate(new Date());
    const currentHour = new Date().getHours();

    const [habits, todayEvents, todayCompletions] = await Promise.all([
      Habit.find({ userId, isArchived: false }).lean(),
      CalendarEvent.find({ userId, date: todayStr }).lean(),
      HabitCompletion.find({ userId, date: todayStr }).lean(),
    ]);

    const completedHabitIds = new Set(
      todayCompletions.filter((c) => c.status === 'completed').map((c) => c.habitId?.toString())
    );

    const pendingHabits = habits.filter((h) => !completedHabitIds.has(h._id.toString()));

    const actions = [];

    // 1. Streak Defense Priority (if streak >= 3 and not completed today)
    const atRiskHabit = pendingHabits.find((h) => (h.currentStreak || 0) >= 3);
    if (atRiskHabit) {
      actions.push({
        id: `nba_streak_${atRiskHabit._id}`,
        title: `Complete ${atRiskHabit.name} (Protect ${atRiskHabit.currentStreak}-Day Streak)`,
        reason: `Your ${atRiskHabit.currentStreak}-day streak is pending execution for today.`,
        durationMinutes: atRiskHabit.targetValue && atRiskHabit.unit === 'minutes' ? atRiskHabit.targetValue : 30,
        priority: 'CRITICAL',
        expectedValue: '+10 Streak Durability Points',
        actionLabel: 'Log Completion',
        actionType: 'COMPLETE_HABIT',
        entityId: atRiskHabit._id.toString(),
      });
    }

    // 2. Scheduled Time Block or Morning Focus
    const nextBlock = todayEvents.find((e) => e.status !== 'completed');
    if (nextBlock) {
      actions.push({
        id: `nba_block_${nextBlock._id}`,
        title: `Execute "${nextBlock.title}"`,
        reason: `Scheduled on your execution calendar for ${nextBlock.startTime || 'today'}.`,
        durationMinutes: 45,
        priority: 'HIGH',
        expectedValue: 'Maintain Scheduled Rhythm',
        actionLabel: 'Open Planner',
        actionType: 'NAVIGATE_PLANNER',
        entityId: nextBlock._id.toString(),
      });
    }

    // 3. High Leverage Goal Routine
    if (pendingHabits.length > 0 && actions.length < 3) {
      const topRoutine = pendingHabits[0];
      if (!actions.some((a) => a.entityId === topRoutine._id.toString())) {
        actions.push({
          id: `nba_routine_${topRoutine._id}`,
          title: `Start 20m Sprint for ${topRoutine.name}`,
          reason: `High-leverage habit that advances your consistency score.`,
          durationMinutes: 20,
          priority: 'MEDIUM',
          expectedValue: '+4% Daily Forge Score',
          actionLabel: 'Quick Start',
          actionType: 'START_FOCUS_TIMER',
          entityId: topRoutine._id.toString(),
        });
      }
    }

    // Fallback if all habits are completed
    if (actions.length === 0) {
      actions.push({
        id: 'nba_review',
        title: 'Complete Today\'s End of Day Review',
        reason: 'All daily habits logged. Capture reflections to solidify neurological learning.',
        durationMinutes: 5,
        priority: 'LOW',
        expectedValue: 'Close Daily Momentum Loop',
        actionLabel: 'Review Day',
        actionType: 'OPEN_DAILY_REVIEW',
      });
    }

    return actions.slice(0, 3);
  }
}

module.exports = NextBestActionEngine;
