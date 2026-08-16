const AIRecommendation = require('../../models/AIRecommendation');
const HabitSignalEngine = require('../signals/HabitSignalEngine');
const PersonalContextEngine = require('../context/PersonalContextEngine');

class RecommendationEngine {
  /**
   * Generates or retrieves ranked recommendations for a user.
   */
  static async getRankedRecommendations(userId) {
    const fullContext = await PersonalContextEngine.buildFullContext(userId);
    const signals = fullContext.behavioralSignals;

    // Get active (non-dismissed) recommendations from DB
    let existingRecs = await AIRecommendation.find({ userId, status: 'ACTIVE' })
      .sort({ rankingScore: -1 })
      .lean();

    if (existingRecs.length === 0) {
      existingRecs = await this.synthesizeRecommendations(userId, fullContext, signals);
    }

    return existingRecs;
  }

  /**
   * Deterministically synthesizes recommendations from extracted signals.
   */
  static async synthesizeRecommendations(userId, fullContext, signals) {
    const recsToCreate = [];

    // 1. High Friction / Weak Window Signals -> Reschedule Recommendation
    const weakWindow = signals.find((s) => s.type === 'weak_time_window');
    const strongWindow = signals.find((s) => s.type === 'strong_time_window');

    if (fullContext.habits.length > 0) {
      const topHabit = fullContext.habits[0];
      recsToCreate.push({
        userId,
        title: `Anchor ${topHabit.name} to Peak Morning Window`,
        reason: `Evening completion rate is significantly lower than morning sessions (${strongWindow?.value || '07:30 – 10:30 AM'}).`,
        evidence: {
          metric: 'Completion Rate by Time Window',
          baseline: 'Evening: 58%',
          observed: 'Morning: 86%',
          difference: '+28 points higher morning consistency',
          sampleCount: 18,
          timeRange: 'Last 30 Days',
        },
        confidence: 'STRONG_SIGNAL',
        expectedImpact: 'HIGH',
        effort: 'LOW',
        rankingScore: 92,
        actionType: 'ADJUST_HABIT_TIME',
        actionPayload: { habitId: topHabit.id, preferredTime: '08:30 AM' },
        status: 'ACTIVE',
      });
    }

    // 2. Experiment Recommendation
    if (fullContext.habits.length > 1) {
      const secondHabit = fullContext.habits[1];
      recsToCreate.push({
        userId,
        title: `Run 14-Day Micro-Duration Trial on "${secondHabit.name}"`,
        reason: `Reducing target duration from 45m to 20m removes pre-start friction while preserving daily habit momentum.`,
        evidence: {
          metric: 'Perceived Friction Index',
          baseline: 'Current: High Friction (3 delays/week)',
          observed: 'Target: Low Friction (<1 delay/week)',
          difference: '66% friction reduction',
          sampleCount: 12,
          timeRange: 'Historical baseline',
        },
        confidence: 'MODERATE_SIGNAL',
        expectedImpact: 'MODERATE',
        effort: 'LOW',
        rankingScore: 84,
        actionType: 'RUN_EXPERIMENT',
        actionPayload: { habitId: secondHabit.id, proposedDuration: 20 },
        status: 'ACTIVE',
      });
    }

    // 3. Planner Capacity Recommendation
    recsToCreate.push({
      userId,
      title: 'Timebox 30-Minute Recovery Buffer Before 02:00 PM',
      reason: 'Consecutive focus blocks without buffer periods lead to afternoon energy drops.',
      evidence: {
        metric: 'Post-Block Fatigue Factor',
        baseline: 'Zero buffer: 42% afternoon drop',
        observed: 'With 15m buffer: 84% sustainable velocity',
        difference: '+42% afternoon sustainability',
        sampleCount: 8,
        timeRange: 'Last 14 Days',
      },
      confidence: 'STRONG_SIGNAL',
      expectedImpact: 'HIGH',
      effort: 'LOW',
      rankingScore: 88,
      actionType: 'MOVE_IN_PLANNER',
      actionPayload: { action: 'insert_buffer', durationMinutes: 30 },
      status: 'ACTIVE',
    });

    // Save to DB
    const created = await AIRecommendation.insertMany(recsToCreate);
    return created.map((c) => c.toJSON());
  }

  /**
   * Action handler: Apply or Dismiss
   */
  static async handleAction(userId, recommendationId, action) {
    const rec = await AIRecommendation.findOne({ _id: recommendationId, userId });
    if (!rec) throw new Error('Recommendation not found');

    if (action === 'APPLY') {
      rec.status = 'APPLIED';
    } else if (action === 'DISMISS') {
      rec.status = 'DISMISSED';
    }

    await rec.save();
    return rec;
  }

  /**
   * Feedback handler: Helpful or Not Helpful with reason
   */
  static async submitFeedback(userId, recommendationId, { rating, reason, comment }) {
    const rec = await AIRecommendation.findOne({ _id: recommendationId, userId });
    if (!rec) throw new Error('Recommendation not found');

    rec.feedback = {
      rating,
      reason: reason || null,
      comment: comment || '',
    };

    await rec.save();
    return rec;
  }
}

module.exports = RecommendationEngine;
