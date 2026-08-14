import { AnalyticsSummary, TimeRange } from '@/types/analytics';

export const analyticsService = {
  async getAnalyticsSummary(_range: TimeRange = '30d'): Promise<AnalyticsSummary> {
    await new Promise((res) => setTimeout(res, 300));
    return {
      consistencyScore: 87,
      totalCompletionsPeriod: 147,
      avgDailyRate: 82,
      bestPerformingHabit: {
        id: 'h_1',
        name: 'Morning Hydration & Electrolytes',
        streak: 14,
        completionRate: 92,
      },
      weakestHabit: {
        id: 'h_4',
        name: 'Mindful Reading (20 Pages)',
        streak: 5,
        completionRate: 78,
      },
      dailyTrends: [
        { date: 'Mon', completionRate: 85, totalCompleted: 5, totalHabits: 6 },
        { date: 'Tue', completionRate: 100, totalCompleted: 6, totalHabits: 6 },
        { date: 'Wed', completionRate: 67, totalCompleted: 4, totalHabits: 6 },
        { date: 'Thu', completionRate: 85, totalCompleted: 5, totalHabits: 6 },
        { date: 'Fri', completionRate: 85, totalCompleted: 5, totalHabits: 6 },
        { date: 'Sat', completionRate: 50, totalCompleted: 3, totalHabits: 6 },
        { date: 'Sun', completionRate: 85, totalCompleted: 5, totalHabits: 6 },
      ],
      categoryBreakdown: [
        { category: 'Health', count: 1, completionRate: 92, color: '#38bdf8' },
        { category: 'Study', count: 1, completionRate: 85, color: '#818cf8' },
        { category: 'Fitness', count: 1, completionRate: 88, color: '#f43f5e' },
        { category: 'Personal', count: 1, completionRate: 78, color: '#a855f7' },
        { category: 'Mindfulness', count: 1, completionRate: 90, color: '#10b981' },
      ],
      habitComparisons: [
        { habitId: 'h_1', habitName: 'Hydration', completionRate: 92, streak: 14 },
        { habitId: 'h_5', habitName: 'Journaling', completionRate: 90, streak: 10 },
        { habitId: 'h_3', habitName: 'Strength', completionRate: 88, streak: 12 },
        { habitId: 'h_2', habitName: 'DSA Study', completionRate: 85, streak: 8 },
        { habitId: 'h_4', habitName: 'Reading', completionRate: 78, streak: 5 },
      ],
      weeklyPerformance: [
        { week: 'W1', rate: 74 },
        { week: 'W2', rate: 81 },
        { week: 'W3', rate: 85 },
        { week: 'W4', rate: 89 },
      ],
    };
  },
};
