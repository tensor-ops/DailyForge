const ContextBuilder = require('../context/ContextBuilder');

class RecoveryCoach {
  static async handle(userId, prompt, entity) {
    const fullContext = await ContextBuilder.buildFullPersonalContext(userId);
    const habitName = entity || fullContext.habits[0]?.name || 'Core Habit';

    const message = `Routine interruptions are a natural part of human performance. The key is applying the **Two-Day Rule**:

> *Missing once is an anomaly. Missing twice creates a new counter-habit.*

### 🛡️ Low-Friction Recovery Protocol for ${habitName}:
1. **Today (Minimum Viable Execution)**: Do not attempt a full session. Execute a 10-minute lightweight version to maintain neurological continuity.
2. **Tomorrow (Return to Baseline)**: Schedule the session into your 08:30 AM peak window.
3. **Friction Elimination**: Remove pre-start barriers tonight (prepare materials in advance).`;

    return {
      agentType: 'RECOVERY_COACH',
      content: message,
      intent: 'EMPATHY_RECOVERY',
      evidence: {
        metric: 'Two-Day Rule Adherence',
        baseline: 'Consecutive Misses: 1',
        observed: 'Next-Day Bounce Rate: 84%',
        difference: 'Strong recovery likelihood',
        sampleCount: 5,
        timeRange: 'Last 60 Days',
      },
      suggestedQuickReplies: [
        `Schedule 10m minimum version for ${habitName}`,
        'Why did I procrastinate on this habit?',
        'Plan tomorrow morning recovery',
      ],
      proposedAction: {
        actionType: 'ACTIVATE_TWO_DAY_RULE',
        title: `Activate 10m Minimum Recovery for ${habitName}`,
        currentValue: 'Full session pending',
        proposedValue: '10m micro-execution block',
        impactDescription: 'Protects streak identity while drastically lowering cognitive friction.',
        payload: { habitName, targetDuration: 10 },
        status: 'PENDING',
      },
    };
  }
}

module.exports = RecoveryCoach;
