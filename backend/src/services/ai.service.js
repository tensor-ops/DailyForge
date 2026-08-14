const axios = require('axios');
const aiConfig = require('../config/ai');
const AIInsight = require('../models/AIInsight');
const AIConversation = require('../models/AIConversation');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const { getAnalyticsOverview } = require('./analytics.service');
const { AIServiceError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Retrieve active AI Insights for user
 */
async function getInsights(userId) {
  let insights = await AIInsight.find({
    userId,
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .lean();

  if (insights.length === 0) {
    insights = await generateInsights(userId);
  }

  return insights.map(formatInsightResponse);
}

/**
 * Generate fresh AI insights based on actual user data
 */
async function generateInsights(userId) {
  const analytics = await getAnalyticsOverview(userId, '30d');
  const habits = await Habit.find({ userId, isArchived: false }).lean();

  let generated = [];

  if (aiConfig.isMock) {
    generated = generateMockInsights(analytics, habits);
  } else {
    try {
      generated = await callExternalAIForInsights(analytics, habits);
    } catch (err) {
      logger.warn(`AI Provider failed (${err.message}). Falling back to mock insights.`);
      generated = generateMockInsights(analytics, habits);
    }
  }

  // Save to DB
  await AIInsight.deleteMany({ userId });
  const docs = await AIInsight.insertMany(
    generated.map((g) => ({
      userId,
      ...g,
    }))
  );

  return docs.map(formatInsightResponse);
}

/**
 * Get AI Recommendations for new habits or schedules
 */
async function getRecommendations(userId) {
  const habits = await Habit.find({ userId, isArchived: false }).lean();
  const categories = habits.map((h) => h.category);

  const recommendations = [
    {
      id: 'rec-1',
      title: 'Morning Mindfulness Routine',
      category: 'Mindfulness',
      reason: 'Pairs well with your morning study schedule for focus enhancement.',
      suggestedFrequency: 'daily',
      estimatedDurationMinutes: 10,
    },
    {
      id: 'rec-2',
      title: 'Hydration & Movement Break',
      category: 'Health',
      reason: 'Improves afternoon energy consistency across active work sessions.',
      suggestedFrequency: 'weekdays',
      estimatedDurationMinutes: 5,
    },
  ];

  if (!categories.includes('Fitness')) {
    recommendations.unshift({
      id: 'rec-3',
      title: '20-Minute Evening Cardio Walk',
      category: 'Fitness',
      reason: 'You currently have no active fitness habit. Adding light exercise boosts sleep quality.',
      suggestedFrequency: 'daily',
      estimatedDurationMinutes: 20,
    });
  }

  return recommendations;
}

/**
 * Interactive Habit Coach Chat
 */
async function chatWithAI(userId, userMessage) {
  let conversation = await AIConversation.findOne({ userId });
  if (!conversation) {
    conversation = await AIConversation.create({ userId, messages: [] });
  }

  // Push user message
  conversation.messages.push({
    sender: 'user',
    content: userMessage,
    timestamp: new Date(),
  });

  let assistantReply = '';
  let suggestedPrompts = [];

  if (aiConfig.isMock) {
    const mockRes = generateMockChatReply(userMessage);
    assistantReply = mockRes.reply;
    suggestedPrompts = mockRes.suggestedPrompts;
  } else {
    try {
      const externalRes = await callExternalAIForChat(userMessage, conversation.messages);
      assistantReply = externalRes.reply;
      suggestedPrompts = externalRes.suggestedPrompts || [];
    } catch (err) {
      logger.warn(`External AI call failed (${err.message}), falling back to mock reply.`);
      const mockRes = generateMockChatReply(userMessage);
      assistantReply = mockRes.reply;
      suggestedPrompts = mockRes.suggestedPrompts;
    }
  }

  // Push assistant response
  conversation.messages.push({
    sender: 'assistant',
    content: assistantReply,
    timestamp: new Date(),
    suggestedPrompts,
  });

  await conversation.save();

  return {
    conversationId: conversation._id.toString(),
    message: {
      id: conversation.messages[conversation.messages.length - 1]._id.toString(),
      sender: 'assistant',
      content: assistantReply,
      timestamp: new Date().toISOString(),
      suggestedPrompts,
    },
  };
}

/**
 * Get AI Conversation History
 */
async function getConversations(userId) {
  const conversation = await AIConversation.findOne({ userId }).lean();
  if (!conversation) return [];

  return (conversation.messages || []).map((m) => ({
    id: m._id.toString(),
    sender: m.sender,
    content: m.content,
    timestamp: m.timestamp.toISOString(),
    suggestedPrompts: m.suggestedPrompts || [],
  }));
}

// Private Helper Functions

function generateMockInsights(analytics, habits) {
  const insights = [
    {
      type: 'achievement',
      headline: `Consistency Score is at ${analytics.consistencyScore}%`,
      explanation: `Your habit execution is strong. Maintain momentum on your primary routines to unlock optimal streak gains.`,
      confidence: 0.92,
      actionLabel: 'View Detailed Analytics',
      actionPayload: { type: 'NAVIGATE', route: '/analytics' },
    },
    {
      type: 'pattern',
      headline: 'Peak Performance Window Identified',
      explanation: 'Data suggests your completion rates are 35% higher when habits are scheduled before 10:00 AM.',
      confidence: 0.88,
      actionLabel: 'Adjust Reminder Times',
      actionPayload: { type: 'OPEN_SETTINGS' },
    },
  ];

  if (analytics.weakestHabit) {
    insights.push({
      type: 'warning',
      headline: `Attention Needed on "${analytics.weakestHabit.name}"`,
      explanation: `Completion rate for "${analytics.weakestHabit.name}" is currently ${analytics.weakestHabit.completionRate}%. Consider reducing target duration to build momentum.`,
      confidence: 0.84,
      actionLabel: 'Edit Target',
      actionPayload: { type: 'EDIT_HABIT', habitId: analytics.weakestHabit.id },
    });
  }

  return insights;
}

function generateMockChatReply(userMessage) {
  const msg = userMessage.toLowerCase();

  if (msg.includes('study') || msg.includes('read') || msg.includes('focus')) {
    return {
      reply: "Struggling with study consistency is often due to friction in starting. Try the '2-Minute Rule': commit to opening your material for just 2 minutes. Once momentum builds, continuation is much easier!",
      suggestedPrompts: [
        'How can I break down my study target?',
        'What time of day is best for deep work?',
        'How to recover from a broken streak?',
      ],
    };
  }

  if (msg.includes('streak') || msg.includes('missed') || msg.includes('broken')) {
    return {
      reply: 'Never double miss! Missing one day is an anomaly; missing two days is the start of a new habit. Focus on completing a light version of your habit today to preserve your habit identity.',
      suggestedPrompts: [
        'How do I stay motivated when tired?',
        'What is a minimum viable habit?',
        'Show my current streak summary',
      ],
    };
  }

  return {
    reply: `I am your AI Habit Coach! Based on your tracking trends, maintaining smaller daily targets yields 4x higher completion rates than sporadic long sessions. How can I assist you with your habits today?`,
    suggestedPrompts: [
      'How can I improve my consistency score?',
      'Suggest a habit for morning energy',
      'Why am I missing my evening routines?',
    ],
  };
}

async function callExternalAIForInsights(analytics, habits) {
  // External Provider Adapter example (OpenAI API compatibility)
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: aiConfig.model,
      messages: [
        {
          role: 'system',
          content: 'You are an AI Habit Coach. Return a JSON array of insights based on user habit data.',
        },
        {
          role: 'user',
          content: JSON.stringify({ analytics, habits }),
        },
      ],
      response_format: { type: 'json_object' },
    },
    {
      headers: { Authorization: `Bearer ${aiConfig.apiKey}` },
    }
  );

  const content = JSON.parse(response.data.choices[0].message.content);
  return content.insights || [];
}

async function callExternalAIForChat(userMessage, messageHistory) {
  const formattedMessages = messageHistory.slice(-10).map((m) => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.content,
  }));

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: aiConfig.model,
      messages: [
        { role: 'system', content: 'You are an empathetic, data-driven Habit Coach.' },
        ...formattedMessages,
      ],
    },
    {
      headers: { Authorization: `Bearer ${aiConfig.apiKey}` },
    }
  );

  return {
    reply: response.data.choices[0].message.content,
    suggestedPrompts: ['How to optimize my schedule?', 'Tips for habit stacking'],
  };
}

function formatInsightResponse(insightObj) {
  return {
    id: insightObj._id ? insightObj._id.toString() : insightObj.id,
    type: insightObj.type,
    headline: insightObj.headline,
    explanation: insightObj.explanation,
    confidence: insightObj.confidence,
    actionLabel: insightObj.actionLabel || '',
    actionPayload: insightObj.actionPayload || null,
    timestamp: insightObj.createdAt ? new Date(insightObj.createdAt).toISOString() : new Date().toISOString(),
  };
}

module.exports = {
  getInsights,
  generateInsights,
  getRecommendations,
  chatWithAI,
  getConversations,
};
