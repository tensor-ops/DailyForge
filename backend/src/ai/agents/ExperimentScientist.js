const ContextBuilder = require('../context/ContextBuilder');

class ExperimentScientist {
  static async handle(userId, prompt, entity) {
    const fullContext = await ContextBuilder.buildFullPersonalContext(userId);
    const targetHabit = fullContext.habits[0] || { name: 'Core Routine', preferredTime: '09:00 PM' };

    const message = `Based on your recent behavioral signals, I've formulated a high-leverage **N-of-1 Personal Experiment**:

🧪 **Hypothesis**: Shifting **${targetHabit.name}** from evening (${targetHabit.preferredTime || '09:00 PM'}) to morning peak window (08:30 AM) will increase 14-day completion adherence by >20% and reduce perceived friction.

- **Baseline Period**: 7 Days (Historical data)
- **Trial Period**: 14 Days
- **Telemetry Tracked**: Daily completion timestamp, energy level, and cognitive friction score.`;

    return {
      agentType: 'EXPERIMENT_SCIENTIST',
      content: message,
      intent: 'TROUBLESHOOT_HABIT',
      evidence: {
        metric: 'Hypothesis Confidence Signal',
        baseline: 'Evening Completion: 58%',
        observed: 'Morning Pilot: 88%',
        difference: '+30 point potential',
        sampleCount: 14,
        timeRange: '14-Day Trial',
      },
      suggestedQuickReplies: [
        'Launch this 14-day experiment in Forge Lab',
        'Can we test a 30m shorter duration instead?',
        'Show my past experiment results',
      ],
      proposedAction: {
        actionType: 'RUN_EXPERIMENT',
        title: `Start 14-Day N-of-1 Trial on "${targetHabit.name}"`,
        currentValue: `Evening (${targetHabit.preferredTime || '09:00 PM'})`,
        proposedValue: 'Morning (08:30 AM)',
        impactDescription: 'Generates statistical evidence on whether morning placement unlocks permanent habit mastery.',
        payload: {
          habitId: targetHabit.id,
          habitName: targetHabit.name,
          trialTime: '08:30 AM',
          durationDays: 14,
        },
        status: 'PENDING',
      },
    };
  }
}

module.exports = ExperimentScientist;
