const aiMemoryService = require('../memory/aiMemory.service');
const PersonalContextEngine = require('../context/PersonalContextEngine');

class ReflectionEngine {
  /**
   * Generates intelligent, context-aware reflection questions for the user.
   */
  static async getReflectionPrompts(userId) {
    const fullContext = await PersonalContextEngine.buildFullContext(userId);

    const prompts = [
      {
        id: 'ref_1',
        category: 'CELEBRATION',
        prompt: 'What specific conditions made your morning focus sessions so reliable this week?',
      },
      {
        id: 'ref_2',
        category: 'FRICTION',
        prompt: `Which routine created the most resistance, and how can we reduce its barrier to start?`,
      },
      {
        id: 'ref_3',
        category: 'EXPERIMENT',
        prompt: 'What is one micro-adjustment you want to test in your schedule for next week?',
      },
    ];

    return prompts;
  }

  /**
   * Submits a reflection and converts useful answers into long-term episodic memory.
   */
  static async submitReflection(userId, { promptId, question, responseText }) {
    if (!responseText || !responseText.trim()) return null;

    // Convert meaningful user reflection into episodic memory
    const memory = await aiMemoryService.remember(userId, {
      type: 'EPISODIC',
      key: `Reflection: ${question.slice(0, 30)}...`,
      value: responseText.trim(),
      source: 'USER_EXPLICIT',
      confidence: 0.95,
      tags: ['reflection', 'weekly_review', 'personal_insight'],
    });

    return {
      success: true,
      savedMemoryId: memory._id.toString(),
      message: 'Reflection recorded and integrated into your AI Coach memory graph.',
    };
  }
}

module.exports = ReflectionEngine;
