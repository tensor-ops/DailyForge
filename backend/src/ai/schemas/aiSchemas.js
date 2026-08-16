/**
 * Strict Structured Output Schemas & Validators for DailyForge AI
 */

const aiSchemas = {
  insight: {
    type: 'object',
    required: ['title', 'category', 'summary', 'evidence', 'confidence', 'actionableStep'],
    properties: {
      title: { type: 'string' },
      category: {
        type: 'string',
        enum: ['CONSISTENCY', 'CIRCADIAN_RHYTHM', 'FRICTION_REDUCTION', 'MOMENTUM_VELOCITY', 'RECOVERY'],
      },
      summary: { type: 'string' },
      evidence: { type: 'string' },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
      actionableStep: { type: 'string' },
    },
  },

  recommendation: {
    type: 'object',
    required: ['title', 'priority', 'impact', 'proposedAction', 'reasoning'],
    properties: {
      title: { type: 'string' },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
      impact: { type: 'string', enum: ['minor', 'moderate', 'high_leverage'] },
      proposedAction: { type: 'string' },
      reasoning: { type: 'string' },
      suggestedTime: { type: 'string' },
    },
  },

  warning: {
    type: 'object',
    required: ['type', 'severity', 'triggerHabit', 'riskDescription', 'mitigationStrategy'],
    properties: {
      type: { type: 'string', enum: ['STREAK_AT_RISK', 'CAPACITY_OVERLOAD', 'WEEKEND_DECAY', 'FRICTION_SPIKE'] },
      severity: { type: 'string', enum: ['low', 'medium', 'high'] },
      triggerHabit: { type: 'string' },
      riskDescription: { type: 'string' },
      mitigationStrategy: { type: 'string' },
    },
  },

  celebration: {
    type: 'object',
    required: ['title', 'milestoneType', 'metricAchieved', 'reinforcementNote'],
    properties: {
      title: { type: 'string' },
      milestoneType: { type: 'string' },
      metricAchieved: { type: 'string' },
      reinforcementNote: { type: 'string' },
    },
  },

  experiment: {
    type: 'object',
    required: ['title', 'hypothesis', 'targetHabitName', 'proposedIntervention', 'durationDays', 'metricToTrack'],
    properties: {
      title: { type: 'string' },
      hypothesis: { type: 'string' },
      targetHabitName: { type: 'string' },
      proposedIntervention: { type: 'string' },
      durationDays: { type: 'number', minimum: 3, maximum: 30 },
      metricToTrack: { type: 'string' },
    },
  },

  plan: {
    type: 'object',
    required: ['goalTitle', 'summary', 'phases'],
    properties: {
      goalTitle: { type: 'string' },
      summary: { type: 'string' },
      phases: {
        type: 'array',
        items: {
          type: 'object',
          required: ['phaseName', 'milestones', 'supportingHabits'],
          properties: {
            phaseName: { type: 'string' },
            milestones: { type: 'array', items: { type: 'string' } },
            supportingHabits: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  },

  coach_response: {
    type: 'object',
    required: ['message', 'intent', 'suggestedQuickReplies'],
    properties: {
      message: { type: 'string' },
      intent: {
        type: 'string',
        enum: ['ANSWER', 'TROUBLESHOOT_HABIT', 'OPTIMIZE_SCHEDULE', 'GOAL_BREAKDOWN', 'CELEBRATE', 'EMPATHY_RECOVERY'],
      },
      supportingSignal: { type: 'string' },
      suggestedQuickReplies: { type: 'array', items: { type: 'string' } },
      proposedToolAction: {
        type: 'object',
        properties: {
          toolName: { type: 'string' },
          parameters: { type: 'object' },
          requiresConfirmation: { type: 'boolean' },
        },
      },
    },
  },

  recovery_plan: {
    type: 'object',
    required: ['targetHabit', 'missReason', 'twoDayRuleAction', 'safetyThreshold'],
    properties: {
      targetHabit: { type: 'string' },
      missReason: { type: 'string' },
      twoDayRuleAction: { type: 'string' },
      safetyThreshold: { type: 'string' },
    },
  },
};

function validateAgainstSchema(data, schemaName) {
  const schema = aiSchemas[schemaName];
  if (!schema) return { valid: true };

  const errors = [];
  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Output must be a non-null object'] };
  }

  for (const field of schema.required || []) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  aiSchemas,
  validateAgainstSchema,
};
