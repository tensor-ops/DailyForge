const Habit = require('../../models/Habit');
const HabitCompletion = require('../../models/HabitCompletion');
const Goal = require('../../models/Goal');
const CalendarEvent = require('../../models/CalendarEvent');
const Experiment = require('../../models/Experiment');
const AIMemory = require('../../models/AIMemory');
const PersonalContextEngine = require('./PersonalContextEngine');
const HabitSignalEngine = require('../signals/HabitSignalEngine');
const { formatDate } = require('../../utils/dates');

/**
 * ContextBuilder
 * Selectively gathers only the precise domain context required for a specific user question.
 */
class ContextBuilder {
  /**
   * Builds targeted context for a single habit (e.g. "Why am I missing DSA?")
   */
  static async buildHabitContext(userId, habitIdentifier) {
    const habitQuery = { userId, isArchived: false };
    if (habitIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
      habitQuery._id = habitIdentifier;
    } else {
      habitQuery.name = { $regex: new RegExp(habitIdentifier.trim(), 'i') };
    }

    const habit = await Habit.findOne(habitQuery).lean();
    if (!habit) {
      return { found: false, message: `Habit "${habitIdentifier}" not found.` };
    }

    const [completions, events, experiments, memories] = await Promise.all([
      HabitCompletion.find({ userId, habitId: habit._id }).sort({ date: -1 }).limit(30).lean(),
      CalendarEvent.find({ userId }).sort({ date: -1 }).limit(20).lean(),
      Experiment.find({ userId, targetHabitId: habit._id }).lean(),
      AIMemory.find({ userId, isActive: true, key: { $regex: new RegExp(habit.name, 'i') } }).lean(),
    ]);

    const totalCompletions = completions.length;
    const completedCount = completions.filter((c) => c.status === 'completed').length;
    const missedCount = completions.filter((c) => c.status === 'missed' || c.status === 'skipped').length;
    const completionRate = totalCompletions > 0 ? Math.round((completedCount / totalCompletions) * 100) : 0;

    // Recent misses breakdown
    const recentMisses = completions
      .filter((c) => c.status === 'missed' || c.status === 'skipped')
      .slice(0, 5)
      .map((c) => ({
        date: c.date,
        reason: c.skipReason || c.notes || 'Unspecified friction',
      }));

    return {
      found: true,
      habit: {
        id: habit._id.toString(),
        name: habit.name,
        category: habit.category,
        streak: habit.currentStreak || 0,
        preferredTime: habit.preferredTime,
        frequency: habit.frequency,
        difficulty: habit.difficulty,
        expectedFriction: habit.expectedFriction,
      },
      analytics: {
        totalObservedDays: totalCompletions,
        completedCount,
        missedCount,
        completionRate,
        recentMisses,
      },
      relatedExperiments: experiments.map((e) => ({
        title: e.title,
        status: e.status,
        resultOutcome: e.resultOutcome,
      })),
      relevantMemories: memories.map((m) => `${m.key}: ${m.value}`),
    };
  }

  /**
   * Builds targeted context for a goal
   */
  static async buildGoalContext(userId, goalId) {
    const goal = await Goal.findOne({ _id: goalId, userId }).lean();
    if (!goal) return { found: false };

    const linkedHabits = await Habit.find({ _id: { $in: goal.habits || [] } }).lean();

    return {
      found: true,
      goal: {
        id: goal._id.toString(),
        name: goal.name,
        description: goal.description,
        progress: goal.progress,
        category: goal.category,
        priority: goal.priority,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        unit: goal.unit,
        targetDate: goal.targetDate,
        milestones: goal.milestones || [],
      },
      supportingHabits: linkedHabits.map((h) => ({
        name: h.name,
        streak: h.currentStreak,
        preferredTime: h.preferredTime,
      })),
    };
  }

  /**
   * Builds planner context
   */
  static async buildPlannerContext(userId, dateStr) {
    const date = dateStr || formatDate(new Date());
    const events = await CalendarEvent.find({ userId, date }).lean();

    return {
      date,
      totalEvents: events.length,
      events: events.map((e) => ({
        title: e.title,
        type: e.type,
        startTime: e.startTime,
        endTime: e.endTime,
        category: e.category,
        priority: e.priority,
        status: e.status,
      })),
    };
  }

  /**
   * Builds full personal context using PersonalContextEngine
   */
  static async buildFullPersonalContext(userId) {
    return PersonalContextEngine.buildFullContext(userId);
  }
}

module.exports = ContextBuilder;
