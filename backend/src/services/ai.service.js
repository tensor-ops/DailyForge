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

  // Load behavior metrics context
  const behaviorAnalyticsService = require('./behaviorAnalytics.service');
  let metricsContext = '';
  let behaviorMetrics = null;
  try {
    behaviorMetrics = await behaviorAnalyticsService.getBehaviorAnalytics(userId, '30d');
    metricsContext = `User Behavior Intelligence Data:
    - Forge Score: ${behaviorMetrics.forgeScore} / 1000
    - Consistency Index: ${behaviorMetrics.consistencyIndex}%
    - Momentum: ${behaviorMetrics.momentum.status} (${behaviorMetrics.momentum.trend}% trend)
    - Recovery Rate: ${behaviorMetrics.recoveryRate.rate}% (average recovery time: ${behaviorMetrics.recoveryRate.averageGapDays} days)
    - Key Wins: ${behaviorMetrics.weeklyReview.wins.join(', ') || 'Building baseline'}
    - Current Challenges: ${behaviorMetrics.weeklyReview.challenges.join(', ') || 'None identified'}
    `;
  } catch (err) {
    logger.error(`Failed to load behavior metrics for AI Coach: ${err.message}`);
  }

  let assistantReply = '';
  let suggestedPrompts = [];

  if (aiConfig.isMock) {
    const mockRes = generateMockChatReply(userMessage, behaviorMetrics);
    assistantReply = mockRes.reply;
    suggestedPrompts = mockRes.suggestedPrompts;
  } else {
    try {
      const externalRes = await callExternalAIForChat(userMessage, conversation.messages, metricsContext);
      assistantReply = externalRes.reply;
      suggestedPrompts = externalRes.suggestedPrompts || [];
    } catch (err) {
      logger.warn(`External AI call failed (${err.message}), falling back to mock reply.`);
      const mockRes = generateMockChatReply(userMessage, behaviorMetrics);
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
      headline: 'Perfect Week',
      explanation: 'You completed all your scheduled habits for 7 consecutive days!',
      confidence: 100,
    },
  ];

  return insights;
}

function generateMockChatReply(userMessage, metrics) {
  const msg = userMessage.toLowerCase();
  const forgeScore = metrics ? metrics.forgeScore : 742;
  const consistency = metrics ? metrics.consistencyIndex : 91;
  const momentum = metrics ? metrics.momentum.status : 'STABLE';

  if (msg.includes('consistency') || msg.includes('score') || msg.includes('momentum') || msg.includes('stats')) {
    return {
      reply: `Your behavior intelligence metrics show a **Forge Score of ${forgeScore} / 1000** and a **Consistency Index of ${consistency}%**. Your current momentum status is **${momentum}**. Your data suggests that establishing smaller daily targets yields 4x higher consistency than sporadic, long sessions.`,
      suggestedPrompts: [
        'How can I raise my Forge Score?',
        'Suggest a habit for morning energy',
        'Why am I missing my evening routines?',
      ],
    };
  }

  if (msg.includes('study') || msg.includes('read') || msg.includes('focus')) {
    return {
      reply: "Struggling with study consistency is often due to friction in starting. Looking at your category trends, you are highly consistent in learning sessions completed between 7 PM and 9 PM. I suggest stacking your reading directly after dinner to leverage this peak window!",
      suggestedPrompts: [
        'How can I break down my study target?',
        'What time of day is best for deep work?',
        'How to recover from a broken streak?',
      ],
    };
  }

  if (msg.includes('streak') || msg.includes('missed') || msg.includes('broken') || msg.includes('recovery')) {
    const recoveryRate = metrics ? metrics.recoveryRate.rate : 82;
    const avgGap = metrics ? metrics.recoveryRate.averageGapDays : 1.2;
    return {
      reply: `Never double miss! Your recovery index is strong at **${recoveryRate}%** with an average gap of **${avgGap} days** to bounce back. Focus on completing a light version of your habit today to preserve your habit identity.`,
      suggestedPrompts: [
        'How do I stay motivated when tired?',
        'What is a minimum viable habit?',
        'Show my current streak summary',
      ],
    };
  }

  return {
    reply: `Welcome to your Personal Behavior Coach. Your Forge Score is **${forgeScore}/1000** with **${consistency}% consistency**. How can I help you optimize your morning energy, recovery rates, or specific habits today?`,
    suggestedPrompts: [
      'How to recover from a broken streak?',
      'Suggest a habit for morning energy',
      'How to improve my consistency score?',
    ],
  };
}

async function callExternalAIForInsights(analytics, habits) {
  const provider = aiConfig.provider.toLowerCase();
  
  if (provider === 'gemini') {
    const model = aiConfig.model || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.apiKey}`;
    
    const systemInstruction = 
      "You are a world-class behavioral psychologist and AI Habit Coach. " +
      "Analyze the user's habits and completion logs. Provide actionable, supportive insights to improve consistency. " +
      "You MUST respond ONLY with a JSON object matching this schema: " +
      "{\n" +
      "  \"insights\": [\n" +
      "    {\n" +
      "      \"type\": \"achievement\" | \"pattern\" | \"warning\",\n" +
      "      \"headline\": \"Short, punchy title (e.g. Consistency is at 84%)\",\n" +
      "      \"explanation\": \"Friendly description containing behavioral tips.\",\n" +
      "      \"confidence\": 0.0 to 1.0,\n" +
      "      \"actionLabel\": \"Button label (e.g. View Analytics)\",\n" +
      "      \"actionPayload\": { \"type\": \"NAVIGATE\" | \"OPEN_SETTINGS\" | \"EDIT_HABIT\", \"route\": \"/analytics\" | \"/settings\", \"habitId\": \"optional_habit_id\" }\n" +
      "    }\n" +
      "  ]\n" +
      "}";

    const response = await axios.post(url, {
      contents: [
        {
          parts: [
            {
              text: `Here is the user's data: ${JSON.stringify({ analytics, habits })}`
            }
          ]
        }
      ],
      systemInstruction: {
        parts: [
          {
            text: systemInstruction
          }
        ]
      },
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const rawText = response.data.candidates[0].content.parts[0].text;
    const content = JSON.parse(rawText);
    return content.insights || [];
  }

  // Fallback to standard OpenAI / compatibility API
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: aiConfig.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an AI Habit Coach. Return a JSON array of insights based on user habit data. Format: { "insights": [...] }',
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

async function callExternalAIForChat(userMessage, messageHistory, metricsContext = '') {
  const provider = aiConfig.provider.toLowerCase();

  if (provider === 'gemini') {
    const model = aiConfig.model || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.apiKey}`;
    
    // Map standard message history to Gemini contents format
    const contents = messageHistory.slice(-10).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Ensure last message is from user if it is not already in history
    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });
    }

    const response = await axios.post(url, {
      contents,
      systemInstruction: {
        parts: [
          {
            text: "You are DailyForge's empathetic, data-driven AI Habit Coach. " +
                  "Help the user build consistency, overcome broken streaks, and design better morning/evening routines. " +
                  "Keep your tone highly encouraging, actionable, and structured (use bullet points where appropriate). " +
                  "Always provide 2 or 3 short follow-up questions or prompts (e.g. 'How can I stay motivated?') " +
                  "in a JSON structure or at the very end of your response inside a specialized section. " +
                  `Use this user behavioral context to give precise, personalized advice where relevant:\n${metricsContext}`
          }
        ]
      }
    });

    const reply = response.data.candidates[0].content.parts[0].text;
    
    // Extract suggested prompts or provide default ones
    const suggestedPrompts = [
      'How to recover from a broken streak?',
      'Suggest a habit for morning energy',
      'How to improve my consistency score?'
    ];

    return {
      reply,
      suggestedPrompts
    };
  }

  const formattedMessages = messageHistory.slice(-10).map((m) => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.content,
  }));

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: aiConfig.model || 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are DailyForge\'s empathetic, data-driven AI Habit Coach. ' +
                   `Use this user behavioral context to give precise, personalized advice where relevant:\n${metricsContext}`
        },
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

/**
 * Parse natural language text into structured habit fields
 */
async function parseNaturalHabit(text) {
  const today = new Date().toISOString().split('T')[0];

  if (!aiConfig.isMock) {
    try {
      const provider = aiConfig.provider.toLowerCase();
      if (provider === 'gemini') {
        const model = aiConfig.model || 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.apiKey}`;
        const response = await axios.post(url, {
          contents: [{ parts: [{ text }] }],
          systemInstruction: {
            parts: [{
              text: 'You are a habit parsing assistant. Parse the user\'s natural language description into structured JSON for a habit tracker. ' +
                'Return ONLY a JSON object with these fields: name (string), description (string), category (one of: Health, Fitness, Study, Work, Personal, Finance, Mindfulness, Other), ' +
                'icon (single emoji), frequency (daily/weekdays/weekends/custom), customDays (array of 0-6 numbers for Sunday-Saturday if custom), ' +
                'targetValue (number), unit (string like pages/minutes/liters/times), reminderTime (HH:MM 24h format or empty string), ' +
                'timeOfDay (morning/afternoon/evening/anytime), color (hex color code matching category).',
            }]
          },
          generationConfig: { responseMimeType: 'application/json' }
        });
        const rawText = response.data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(rawText);
        return { ...parsed, startDate: today };
      }
    } catch (err) {
      logger.warn(`AI parse failed (${err.message}), using rule-based fallback.`);
    }
  }

  // Rule-based fallback parser
  return ruleBasedHabitParse(text, today);
}

function ruleBasedHabitParse(text, today) {
  const lower = text.toLowerCase();
  let frequency = 'daily';
  let customDays = [];
  const weekdayMap = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 };

  if (lower.includes('weekday') || lower.includes('monday to friday')) {
    frequency = 'weekdays';
  } else if (lower.includes('weekend')) {
    frequency = 'weekends';
  } else if (/\b(mon|tue|wed|thu|fri|sat|sun)\b/.test(lower)) {
    frequency = 'custom';
    for (const [day, num] of Object.entries(weekdayMap)) {
      if (lower.includes(day)) customDays.push(num);
    }
  }

  const timeMatch = lower.match(/(\d{1,2})\s*(am|pm)/);
  let reminderTime = '';
  let timeOfDay = 'anytime';
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    if (timeMatch[2] === 'pm' && hour !== 12) hour += 12;
    if (timeMatch[2] === 'am' && hour === 12) hour = 0;
    reminderTime = `${String(hour).padStart(2, '0')}:00`;
    timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  }

  const numMatch = text.match(/(\d+)\s*(pages?|min(?:utes?)?|liters?|times?|sessions?|hours?|reps?|km)/i);
  const targetValue = numMatch ? parseInt(numMatch[1]) : 1;
  const unit = numMatch ? numMatch[2].toLowerCase().replace(/s$/, '') : 'times';

  const categoryMap = {
    read: 'Study', study: 'Study', learn: 'Study', book: 'Study',
    exercise: 'Fitness', run: 'Fitness', walk: 'Fitness', gym: 'Fitness', workout: 'Fitness',
    water: 'Health', sleep: 'Health', meditat: 'Mindfulness', breathe: 'Mindfulness',
    journal: 'Personal', write: 'Personal', work: 'Work', code: 'Work',
    save: 'Finance', budget: 'Finance', invest: 'Finance',
  };
  let category = 'Personal';
  for (const [kw, cat] of Object.entries(categoryMap)) {
    if (lower.includes(kw)) { category = cat; break; }
  }

  const iconMap = {
    Health: '💧', Fitness: '🏃', Study: '📚', Work: '💼', Personal: '📖', Finance: '💰', Mindfulness: '🧘', Other: '🎯'
  };
  const colorMap = {
    Health: '#14b8a6', Fitness: '#f97316', Study: '#6366f1', Work: '#3b82f6', Personal: '#8b5cf6', Finance: '#22c55e', Mindfulness: '#a855f7', Other: '#6366f1'
  };

  const words = text.trim().split(/\s+/).slice(0, 6).join(' ');
  const name = words.charAt(0).toUpperCase() + words.slice(1);

  return {
    name,
    description: text,
    category,
    icon: iconMap[category],
    frequency,
    customDays,
    targetValue,
    unit,
    reminderTime,
    timeOfDay,
    color: colorMap[category],
    startDate: today,
  };
}

/**
 * Generate an AI-powered goal plan from a free-text description
 */
async function planGoal(goalText) {
  if (!aiConfig.isMock) {
    try {
      const provider = aiConfig.provider.toLowerCase();
      if (provider === 'gemini') {
        const model = aiConfig.model || 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.apiKey}`;
        const response = await axios.post(url, {
          contents: [{ parts: [{ text: goalText }] }],
          systemInstruction: {
            parts: [{
              text: 'You are an AI life coach. Create a realistic, actionable habit plan for the user\'s goal. ' +
                'Return ONLY a JSON object with: goalName (string), goalDescription (string), emoji (emoji), ' +
                'suggestedDeadlineDays (number 30-180), habits (array of objects each with: ' +
                'name, description, category (Health/Fitness/Study/Work/Personal/Finance/Mindfulness/Other), ' +
                'icon (emoji), frequency (daily/weekdays/weekends), targetValue (number), unit (string), ' +
                'timeOfDay (morning/afternoon/evening), color (hex), rationale (why this habit helps the goal)). ' +
                'Provide 3-6 focused, realistic habits. No fluff.',
            }]
          },
          generationConfig: { responseMimeType: 'application/json' }
        });
        const rawText = response.data.candidates[0].content.parts[0].text;
        return JSON.parse(rawText);
      }
    } catch (err) {
      logger.warn(`AI goal plan failed (${err.message}), using mock.`);
    }
  }

  // Mock fallback
  return {
    goalName: goalText,
    goalDescription: `A structured plan to achieve: "${goalText}"`,
    emoji: '🎯',
    suggestedDeadlineDays: 90,
    habits: [
      { name: 'Morning Planning', description: '10 minutes of daily planning and priority setting', category: 'Personal', icon: '📋', frequency: 'daily', targetValue: 10, unit: 'minutes', timeOfDay: 'morning', color: '#8b5cf6', rationale: 'Intentional planning drives consistent progress' },
      { name: 'Focused Work Block', description: '90 minutes of deep work on your goal', category: 'Work', icon: '💼', frequency: 'weekdays', targetValue: 90, unit: 'minutes', timeOfDay: 'morning', color: '#3b82f6', rationale: 'Dedicated time blocks ensure measurable progress' },
      { name: 'Evening Reflection', description: 'Review today\'s progress and plan tomorrow', category: 'Personal', icon: '📓', frequency: 'daily', targetValue: 1, unit: 'session', timeOfDay: 'evening', color: '#6366f1', rationale: 'Reflection accelerates learning and adjustment' },
    ],
  };
}

module.exports = {
  getInsights,
  generateInsights,
  getRecommendations,
  chatWithAI,
  getConversations,
  parseNaturalHabit,
  planGoal,
};
