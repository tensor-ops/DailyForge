const Habit = require('../../models/Habit');
const HabitCompletion = require('../../models/HabitCompletion');

class HabitRiskEngine {
  /**
   * Generates habit risk categorization (At Risk, Watch, Stable) with early warning telemetry.
   */
  static async computeRiskMap(userId) {
    const [habits, completions] = await Promise.all([
      Habit.find({ userId, isArchived: false }).lean(),
      HabitCompletion.find({ userId }).sort({ date: -1 }).limit(100).lean(),
    ]);

    const riskMap = {
      atRisk: [],
      watch: [],
      stable: [],
    };

    for (const habit of habits) {
      const hComps = completions.filter((c) => c.habitId?.toString() === habit._id.toString());
      const recent7 = hComps.slice(0, 7);
      const doneCount = recent7.filter((c) => c.status === 'completed').length;
      const recentRate = recent7.length > 0 ? Math.round((doneCount / recent7.length) * 100) : 100;

      const riskItem = {
        habitId: habit._id.toString(),
        name: habit.name,
        category: habit.category,
        currentStreak: habit.currentStreak || 0,
        recent7DayRate: `${recentRate}%`,
        frictionLevel: habit.expectedFriction || 'medium',
      };

      if (recentRate < 50 || (hComps.length > 0 && hComps[0].status === 'missed' && hComps[1]?.status === 'missed')) {
        riskMap.atRisk.push({
          ...riskItem,
          riskLevel: 'AT_RISK',
          reason: 'Multiple consecutive misses or recent completion rate fell below 50%.',
          suggestedMitigation: 'Activate Two-Day Rule: execute a 10m micro-version today.',
        });
      } else if (recentRate < 75 || habit.expectedFriction === 'high') {
        riskMap.watch.push({
          ...riskItem,
          riskLevel: 'WATCH',
          reason: 'High perceived friction or moderate variability in execution times.',
          suggestedMitigation: 'Anchor to morning peak window or reduce session duration.',
        });
      } else {
        riskMap.stable.push({
          ...riskItem,
          riskLevel: 'STABLE',
          reason: 'Reliable execution with consistent habit automaticity.',
          suggestedMitigation: 'Maintain current schedule anchor.',
        });
      }
    }

    return riskMap;
  }
}

module.exports = HabitRiskEngine;
