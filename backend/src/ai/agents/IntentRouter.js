/**
 * IntentRouter
 * Analyzes user prompts and routes them to the appropriate specialized behavioral agent.
 */

class IntentRouter {
  static route(userPrompt) {
    const text = (userPrompt || '').toLowerCase();

    // 1. Recovery Coach (misses, broke streak, fell off, struggle)
    if (
      text.includes('missed') ||
      text.includes('broke streak') ||
      text.includes('struggling') ||
      text.includes('fell off') ||
      text.includes('lost my momentum') ||
      text.includes('reset') ||
      text.includes('why am i struggling')
    ) {
      return {
        agentType: 'RECOVERY_COACH',
        confidence: 0.95,
        primaryEntity: this.extractEntity(text),
      };
    }

    // 2. Planner Optimizer (schedule, plan tomorrow, timebox, calendar, conflict)
    if (
      text.includes('plan') ||
      text.includes('schedule') ||
      text.includes('timebox') ||
      text.includes('tomorrow') ||
      text.includes('calendar') ||
      text.includes('optimal window') ||
      text.includes('fit into my day')
    ) {
      return {
        agentType: 'PLANNER_OPTIMIZER',
        confidence: 0.92,
        primaryEntity: null,
      };
    }

    // 3. Goal Strategist (goals, milestone, career, target, roadmap)
    if (
      text.includes('goal') ||
      text.includes('milestone') ||
      text.includes('roadmap') ||
      text.includes('reach my') ||
      text.includes('breakdown')
    ) {
      return {
        agentType: 'GOAL_STRATEGIST',
        confidence: 0.9,
        primaryEntity: this.extractEntity(text),
      };
    }

    // 4. Momentum & Friction Analyst (momentum score, velocity, friction, dropped)
    if (
      text.includes('momentum') ||
      text.includes('friction') ||
      text.includes('consistency score') ||
      text.includes('forge score') ||
      text.includes('why is my momentum')
    ) {
      return {
        agentType: 'MOMENTUM_ANALYST',
        confidence: 0.9,
        primaryEntity: null,
      };
    }

    // 5. Progress Narrator (how am i doing, progress, trends, week analysis)
    if (
      text.includes('how am i') ||
      text.includes('progress') ||
      text.includes('analyze my week') ||
      text.includes('review') ||
      text.includes('trends') ||
      text.includes('summary')
    ) {
      return {
        agentType: 'PROGRESS_NARRATOR',
        confidence: 0.88,
        primaryEntity: null,
      };
    }

    // 6. Experiment Scientist (experiment, hypothesis, trial, test)
    if (
      text.includes('experiment') ||
      text.includes('hypothesis') ||
      text.includes('test') ||
      text.includes('n-of-1') ||
      text.includes('suggest an experiment')
    ) {
      return {
        agentType: 'EXPERIMENT_SCIENTIST',
        confidence: 0.92,
        primaryEntity: this.extractEntity(text),
      };
    }

    // 7. Habit Coach (habit specifics, improve, dsa, reading, workout)
    return {
      agentType: 'HABIT_COACH',
      confidence: 0.85,
      primaryEntity: this.extractEntity(text),
    };
  }

  static extractEntity(text) {
    // Basic regex extraction for common habit or goal keywords
    const match = text.match(/(?:for|on|with|in|my|about)\s+([a-zA-Z0-9\s]{2,25})/i);
    return match ? match[1].trim() : null;
  }
}

module.exports = IntentRouter;
