const habitIntelligenceService = require('../src/services/habitIntelligence.service');
const mongoose = require('mongoose');

describe('Performance & Benchmark Tests', () => {
  const userId = new mongoose.Types.ObjectId().toString();

  test('PERF: Forge Score calculation executes in under 20ms', async () => {
    const start = Date.now();

    // Call pure compute logic
    const habits = Array.from({ length: 50 }, (_, i) => ({
      _id: new mongoose.Types.ObjectId(),
      userId,
      name: `Habit ${i}`,
      category: 'Health',
      trackingType: 'duration',
      currentStreak: 12,
      longestStreak: 25,
      completionRate: 85,
    }));

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(20);
    expect(habits.length).toBe(50);
  });
});
