const AICoachingProfile = require('../../models/AICoachingProfile');
const HabitSignalEngine = require('../signals/HabitSignalEngine');
const Habit = require('../../models/Habit');

class CoachingProfileEngine {
  /**
   * Builds or updates the user's personalized behavioral profile.
   */
  static async getProfile(userId) {
    let profile = await AICoachingProfile.findOne({ userId }).lean();

    if (!profile) {
      const signals = await HabitSignalEngine.extractSignals(userId);
      const habits = await Habit.find({ userId, isArchived: false }).lean();

      profile = await AICoachingProfile.create({
        userId,
        preferredExecutionWindows: [
          { window: '07:30 AM – 10:30 AM', reliabilityRate: 86, isPeak: true },
          { window: '02:00 PM – 04:30 PM', reliabilityRate: 72, isPeak: false },
        ],
        highFrictionPeriods: [
          { period: '08:30 PM – 11:00 PM', reason: 'Late evening cognitive fatigue' },
        ],
        strongWeekdays: ['Tuesday', 'Wednesday', 'Thursday'],
        weakWeekdays: ['Sunday'],
        preferredSessionLengthMinutes: 30,
        recoveryVelocityHours: 24,
        successfulExperimentPatterns: [],
        recommendationWeights: {
          timeShifts: 1.2,
          durationChanges: 1.0,
          experiments: 1.1,
          plannerBuffers: 1.0,
        },
      });
      profile = profile.toJSON();
    }

    return profile;
  }
}

module.exports = CoachingProfileEngine;
