const Habit = require('../../models/Habit');
const HabitCompletion = require('../../models/HabitCompletion');
const Goal = require('../../models/Goal');
const Task = require('../../models/Task');
const CalendarEvent = require('../../models/CalendarEvent');
const Experiment = require('../../models/Experiment');
const AIMemory = require('../../models/AIMemory');
const User = require('../../models/User');
const habitIntelligenceService = require('../../services/habitIntelligence.service');
const milestoneService = require('../../services/milestone.service');
const { formatDate } = require('../../utils/dates');

/**
 * AI Data Tools Definition & Registry
 * READ tools execute automatically.
 * WRITE tools return structured action proposals requiring explicit user confirmation.
 */

const toolRegistry = {
  // --- READ TOOLS (Automatic Execution) ---

  async getUserProfile({ userId }) {
    const user = await User.findById(userId).select('name email preferences stats createdAt').lean();
    return user || {};
  },

  async getHabits({ userId, category = null }) {
    const query = { userId, isArchived: false };
    if (category) query.category = category;
    return Habit.find(query).sort({ createdAt: -1 }).lean();
  },

  async getHabit({ userId, habitId }) {
    return Habit.findOne({ _id: habitId, userId }).lean();
  },

  async getHabitHistory({ userId, habitId, days = 30 }) {
    return HabitCompletion.find({ userId, habitId }).sort({ date: -1 }).limit(days).lean();
  },

  async getAnalytics({ userId, timeframe = '30d' }) {
    return habitIntelligenceService.getAnalyticsOverview(userId, timeframe);
  },

  async getGrowth({ userId }) {
    return habitIntelligenceService.getGrowthDashboard(userId);
  },

  async getMomentum({ userId }) {
    return habitIntelligenceService.getMomentumDashboard(userId);
  },

  async getGoals({ userId }) {
    return Goal.find({ userId, status: { $ne: 'archived' } }).lean();
  },

  async getGoalProgress({ userId, goalId }) {
    return Goal.findOne({ _id: goalId, userId }).lean();
  },

  async getPlanner({ userId, date = null }) {
    const dateStr = date || formatDate(new Date());
    return CalendarEvent.find({ userId, date: dateStr }).sort({ startMinutes: 1 }).lean();
  },

  async getMilestones({ userId }) {
    return milestoneService.getMilestonesOverview(userId);
  },

  async getExperiments({ userId, status = null }) {
    const query = { userId };
    if (status) query.status = status;
    return Experiment.find(query).sort({ createdAt: -1 }).lean();
  },

  async getMemory({ userId, type = null }) {
    const query = { userId, isActive: true };
    if (type) query.type = type;
    return AIMemory.find(query).lean();
  },

  // --- WRITE TOOLS (Require Confirmation) ---

  async proposeHabitUpdate({ userId, habitId, changes }) {
    // Does NOT mutate database directly; generates confirmation request
    const habit = await Habit.findOne({ _id: habitId, userId }).lean();
    if (!habit) throw new Error('Habit not found or unauthorized.');

    return {
      requiresConfirmation: true,
      action: 'UPDATE_HABIT',
      habitId,
      habitName: habit.name,
      proposedChanges: changes,
      confirmationMessage: `Do you want to update "${habit.name}" to time: ${changes.preferredTime || habit.preferredTime}?`,
    };
  },

  async proposeScheduleAdjustment({ userId, eventId, proposedTime }) {
    const event = await CalendarEvent.findOne({ _id: eventId, userId }).lean();
    if (!event) throw new Error('Event not found or unauthorized.');

    return {
      requiresConfirmation: true,
      action: 'RESCHEDULE_EVENT',
      eventId,
      eventTitle: event.title,
      proposedTime,
      confirmationMessage: `Do you want to move "${event.title}" to ${proposedTime}?`,
    };
  },
};

/**
 * Execute an authorized tool by name
 */
async function executeTool(userId, toolName, params = {}) {
  const toolFn = toolRegistry[toolName];
  if (!toolFn) {
    throw new Error(`Unauthorized or unknown AI tool: "${toolName}"`);
  }

  // Enforce strict userId scoping
  const scopedParams = { ...params, userId };
  const startTime = Date.now();

  try {
    const result = await toolFn(scopedParams);
    return {
      success: true,
      toolName,
      data: result,
      durationMs: Date.now() - startTime,
    };
  } catch (err) {
    return {
      success: false,
      toolName,
      error: err.message,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Get definitions of all tools for LLM tool calling schema
 */
function getToolDefinitions() {
  return [
    {
      name: 'getHabits',
      description: "Retrieve list of active user's habits with streaks and schedules",
      parameters: { type: 'object', properties: { category: { type: 'string' } } },
    },
    {
      name: 'getHabitHistory',
      description: 'Get completion logs and miss notes for a specific habit',
      parameters: { type: 'object', required: ['habitId'], properties: { habitId: { type: 'string' }, days: { type: 'number' } } },
    },
    {
      name: 'getAnalytics',
      description: 'Get user consistency, Forge Score, and friction telemetry',
      parameters: { type: 'object', properties: { timeframe: { type: 'string' } } },
    },
    {
      name: 'getPlanner',
      description: 'Get calendar scheduled blocks for a given date',
      parameters: { type: 'object', properties: { date: { type: 'string' } } },
    },
    {
      name: 'proposeHabitUpdate',
      description: 'Propose a habit change (requires user approval)',
      parameters: {
        type: 'object',
        required: ['habitId', 'changes'],
        properties: { habitId: { type: 'string' }, changes: { type: 'object' } },
      },
    },
  ];
}

module.exports = {
  executeTool,
  getToolDefinitions,
  toolRegistry,
};
