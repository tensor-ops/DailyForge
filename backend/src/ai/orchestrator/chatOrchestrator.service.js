const AIConversation = require('../../models/AIConversation');
const AIMessage = require('../../models/AIMessage');
const IntentRouter = require('../agents/IntentRouter');
const HabitCoach = require('../agents/HabitCoach');
const PlannerOptimizer = require('../agents/PlannerOptimizer');
const GoalStrategist = require('../agents/GoalStrategist');
const MomentumAnalyst = require('../agents/MomentumAnalyst');
const RecoveryCoach = require('../agents/RecoveryCoach');
const ProgressNarrator = require('../agents/ProgressNarrator');
const ExperimentScientist = require('../agents/ExperimentScientist');
const Habit = require('../../models/Habit');
const CalendarEvent = require('../../models/CalendarEvent');
const aiUsageService = require('../observability/aiUsage.service');

class ChatOrchestrator {
  /**
   * Process user chat message with intelligent intent routing and structured agent response.
   */
  static async sendMessage(userId, userMessage, conversationId = null) {
    const startTime = Date.now();

    // 1. Get or create conversation thread
    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, userId });
    }
    if (!conversation) {
      conversation = await AIConversation.create({
        userId,
        title: userMessage.slice(0, 40) + '...',
      });
    }

    // 2. Save user message
    await AIMessage.create({
      conversationId: conversation._id,
      userId,
      role: 'user',
      content: userMessage,
    });

    // 3. Route intent to specialized agent
    const route = IntentRouter.route(userMessage);
    conversation.activeAgent = route.agentType;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    let agentResponse;
    switch (route.agentType) {
      case 'RECOVERY_COACH':
        agentResponse = await RecoveryCoach.handle(userId, userMessage, route.primaryEntity);
        break;
      case 'PLANNER_OPTIMIZER':
        agentResponse = await PlannerOptimizer.handle(userId, userMessage);
        break;
      case 'GOAL_STRATEGIST':
        agentResponse = await GoalStrategist.handle(userId, userMessage, route.primaryEntity);
        break;
      case 'MOMENTUM_ANALYST':
        agentResponse = await MomentumAnalyst.handle(userId, userMessage);
        break;
      case 'PROGRESS_NARRATOR':
        agentResponse = await ProgressNarrator.handle(userId, userMessage);
        break;
      case 'EXPERIMENT_SCIENTIST':
        agentResponse = await ExperimentScientist.handle(userId, userMessage, route.primaryEntity);
        break;
      case 'HABIT_COACH':
      default:
        agentResponse = await HabitCoach.handle(userId, userMessage, route.primaryEntity);
        break;
    }

    // 4. Save assistant message
    const assistantMessage = await AIMessage.create({
      conversationId: conversation._id,
      userId,
      role: 'assistant',
      content: agentResponse.content,
      agentType: agentResponse.agentType,
      intent: agentResponse.intent,
      evidence: agentResponse.evidence || null,
      suggestedQuickReplies: agentResponse.suggestedQuickReplies || [],
      proposedAction: agentResponse.proposedAction || null,
    });

    // 5. Track AI usage
    await aiUsageService.trackUsage(userId, {
      provider: 'local',
      model: 'dailyforge-agent-v1',
      requestType: 'COACH_CHAT',
      inputTokens: userMessage.length / 4,
      outputTokens: agentResponse.content.length / 4,
      latencyMs: Date.now() - startTime,
      status: 'SUCCESS',
    });

    return {
      conversationId: conversation._id.toString(),
      message: assistantMessage.toJSON(),
    };
  }

  /**
   * Get conversation list and message history
   */
  static async getHistory(userId, conversationId = null) {
    const conversations = await AIConversation.find({ userId, isArchived: false })
      .sort({ lastMessageAt: -1 })
      .limit(10)
      .lean();

    let activeConversationId = conversationId;
    if (!activeConversationId && conversations.length > 0) {
      activeConversationId = conversations[0]._id.toString();
    }

    let messages = [];
    if (activeConversationId) {
      messages = await AIMessage.find({ conversationId: activeConversationId, userId })
        .sort({ createdAt: 1 })
        .lean();
    }

    return {
      conversations,
      activeConversationId,
      messages,
    };
  }

  /**
   * Confirm and execute an action proposed by an agent (e.g. adjust habit time, apply schedule)
   */
  static async confirmAction(userId, messageId) {
    const msg = await AIMessage.findOne({ _id: messageId, userId });
    if (!msg || !msg.proposedAction) {
      throw new Error('Action proposal not found or unauthorized');
    }

    const { actionType, payload } = msg.proposedAction;

    if (actionType === 'ADJUST_HABIT_TIME' && payload.habitId) {
      await Habit.findOneAndUpdate(
        { _id: payload.habitId, userId },
        { preferredTime: payload.preferredTime }
      );
    } else if (actionType === 'APPLY_OPTIMIZED_SCHEDULE' && payload.date) {
      // Auto-schedule apply trigger
      const autoScheduleService = require('../../services/autoSchedule.service');
      const preview = await autoScheduleService.generateAutoSchedulePreview(userId, payload.date);
      await autoScheduleService.applyAutoSchedule(userId, payload.date, preview.proposedEvents);
    }

    msg.proposedAction.status = 'CONFIRMED';
    await msg.save();

    return {
      success: true,
      actionType,
      message: `Action "${msg.proposedAction.title}" confirmed and executed successfully.`,
    };
  }
}

module.exports = ChatOrchestrator;
