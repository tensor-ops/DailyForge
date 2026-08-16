const Habit = require('../../models/Habit');
const HabitCompletion = require('../../models/HabitCompletion');
const Goal = require('../../models/Goal');
const Task = require('../../models/Task');
const CalendarEvent = require('../../models/CalendarEvent');
const Experiment = require('../../models/Experiment');
const AIMemory = require('../../models/AIMemory');
const User = require('../../models/User');
const HabitSignalEngine = require('../signals/HabitSignalEngine');
const habitIntelligenceService = require('../../services/habitIntelligence.service');
const { formatDate } = require('../../utils/dates');

/**
 * PersonalContextEngine
 * Gathers, weighs, and structures the user's authentic behavioral data into grounded context.
 */
class PersonalContextEngine {
  /**
   * Computes the mathematical Personalization Coverage (0–100%) and learning state.
   */
  static calculatePersonalizationCoverage(data) {
    let score = 0;

    // 1. Habit Portfolio (up to 20%)
    const habitCount = data.habits?.length || 0;
    if (habitCount >= 1) score += 10;
    if (habitCount >= 3) score += 10;

    // 2. Completion Logs Depth (up to 30%)
    const completionCount = data.completions?.length || 0;
    if (completionCount >= 5) score += 10;
    if (completionCount >= 15) score += 10;
    if (completionCount >= 30) score += 10;

    // 3. Goals & Roadmap (up to 15%)
    const goalCount = data.goals?.length || 0;
    if (goalCount >= 1) score += 10;
    if (goalCount >= 2) score += 5;

    // 4. Planner & Execution Blocks (up to 15%)
    const eventCount = data.events?.length || 0;
    if (eventCount >= 3) score += 10;
    if (eventCount >= 8) score += 5;

    // 5. Forge Lab Experiments & Signals (up to 10%)
    const experimentCount = data.experiments?.length || 0;
    if (experimentCount >= 1) score += 5;
    if (data.signals?.length >= 2) score += 5;

    // 6. AI Memory & Interaction (up to 10%)
    const memoryCount = data.memories?.length || 0;
    if (memoryCount >= 1) score += 5;
    if (memoryCount >= 3) score += 5;

    const percentage = Math.min(100, score);
    let state = 'LEARNING';
    if (percentage >= 70) state = 'READY';
    else if (percentage >= 30) state = 'EMERGING';

    return {
      percentage,
      state, // 'LEARNING' | 'EMERGING' | 'READY'
      dataPoints: {
        habits: habitCount,
        completions: completionCount,
        goals: goalCount,
        plannerEvents: eventCount,
        experiments: experimentCount,
        memories: memoryCount,
        signals: data.signals?.length || 0,
      },
    };
  }

  /**
   * Builds the comprehensive personal context.
   */
  static async buildFullContext(userId) {
    const todayStr = formatDate(new Date());

    const [
      user,
      habits,
      completions,
      goals,
      tasks,
      events,
      experiments,
      memories,
      signals,
    ] = await Promise.all([
      User.findById(userId).select('name email preferences stats createdAt').lean(),
      Habit.find({ userId, isArchived: false }).lean(),
      HabitCompletion.find({ userId }).sort({ date: -1 }).limit(100).lean(),
      Goal.find({ userId, status: { $ne: 'archived' } }).lean(),
      Task.find({ userId, status: { $ne: 'archived' } }).limit(20).lean(),
      CalendarEvent.find({ userId, date: todayStr }).lean(),
      Experiment.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
      AIMemory.find({ userId, isActive: true }).sort({ confidence: -1 }).limit(20).lean(),
      HabitSignalEngine.extractSignals(userId),
    ]);

    const coverage = this.calculatePersonalizationCoverage({
      habits,
      completions,
      goals,
      events,
      experiments,
      memories,
      signals,
    });

    return {
      userId: userId.toString(),
      userName: user?.name || 'User',
      personalizationCoverage: coverage,
      today: {
        date: todayStr,
        scheduledEventsCount: events.length,
        events: events.map((e) => ({
          id: e._id.toString(),
          title: e.title,
          type: e.type,
          startTime: e.startTime,
          endTime: e.endTime,
          isCompleted: e.status === 'completed',
        })),
      },
      habits: habits.map((h) => ({
        id: h._id.toString(),
        name: h.name,
        category: h.category,
        streak: h.currentStreak || 0,
        preferredTime: h.preferredTime,
        frequency: h.frequency,
        difficulty: h.difficulty,
        friction: h.expectedFriction,
      })),
      goals: goals.map((g) => ({
        id: g._id.toString(),
        name: g.name,
        progress: g.progress,
        category: g.category,
        priority: g.priority,
        targetDate: g.targetDate,
      })),
      activeExperiments: experiments
        .filter((e) => e.status === 'RUNNING' || e.status === 'ANALYZING')
        .map((e) => ({
          id: e._id.toString(),
          title: e.title,
          status: e.status,
          targetHabit: e.targetHabitName,
          adherenceScore: e.telemetry?.adherenceScore || 0,
        })),
      behavioralSignals: signals,
      aiMemories: {
        facts: memories.filter((m) => m.type === 'FACT').map((m) => ({ key: m.key, value: m.value })),
        analytic: memories.filter((m) => m.type === 'ANALYTIC').map((m) => ({ key: m.key, value: m.value })),
        episodic: memories.filter((m) => m.type === 'EPISODIC').map((m) => ({ key: m.key, value: m.value })),
      },
    };
  }
}

module.exports = PersonalContextEngine;
