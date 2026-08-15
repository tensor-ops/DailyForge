const mongoose = require('mongoose');
const behaviorAnalyticsService = require('../src/services/behaviorAnalytics.service');
const Habit = require('../src/models/Habit');
const HabitCompletion = require('../src/models/HabitCompletion');
const HabitMiss = require('../src/models/HabitMiss');
const EnergyLog = require('../src/models/EnergyLog');
const Goal = require('../src/models/Goal');
const Experiment = require('../src/models/Experiment');

jest.mock('../src/models/Habit');
jest.mock('../src/models/HabitCompletion');
jest.mock('../src/models/HabitMiss');
jest.mock('../src/models/EnergyLog');
jest.mock('../src/models/Goal');
jest.mock('../src/models/Experiment');

describe('Behavior Intelligence Engine Tests', () => {
  const userId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return baseline building status if user has few completions', async () => {
    Habit.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: new mongoose.Types.ObjectId(), name: 'DSA Practice', completionRate: 0 },
      ]),
    });

    HabitCompletion.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    });

    HabitCompletion.countDocuments.mockResolvedValue(2); // Less than 15 baseline
    HabitCompletion.findOne.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ date: '2026-08-10' }),
      }),
    });

    HabitMiss.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    });
    EnergyLog.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    });
    Goal.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
    Experiment.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

    const result = await behaviorAnalyticsService.getBehaviorAnalytics(userId, '30d');
    
    expect(result.isBaselineBuilding).toBe(true);
    expect(result.baselineProgress.completionsCount).toBe(2);
    expect(result.forgeScore).toBeDefined();
  });

  test('should calculate valid weighted Forge Score with high completion data', async () => {
    const habitId1 = new mongoose.Types.ObjectId();
    const habitId2 = new mongoose.Types.ObjectId();

    Habit.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: habitId1, name: 'DSA Practice', completionRate: 90, currentStreak: 12 },
        { _id: habitId2, name: 'Exercise', completionRate: 80, currentStreak: 5 },
      ]),
    });

    // Populate completions history (simulate 40 completions to pass baseline check)
    const mockCompletions = [];
    for (let i = 0; i < 40; i++) {
      mockCompletions.push({
        habitId: i % 2 === 0 ? habitId1 : habitId2,
        date: `2026-08-${String(i + 1).padStart(2, '0')}`,
        completedAt: new Date(`2026-08-${String(i + 1).padStart(2, '0')}T08:30:00Z`),
      });
    }

    HabitCompletion.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockCompletions),
      }),
    });

    HabitCompletion.countDocuments.mockResolvedValue(40);
    HabitCompletion.findOne.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ date: '2026-07-01' }),
      }),
    });

    HabitMiss.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    });
    EnergyLog.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { energy: 8, focus: 9 },
        { energy: 7, focus: 8 },
      ]),
    });
    Goal.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: new mongoose.Types.ObjectId(), progress: 85, createdAt: new Date() }]) });
    Experiment.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

    const result = await behaviorAnalyticsService.getBehaviorAnalytics(userId, '30d');
    
    expect(result.isBaselineBuilding).toBe(false);
    expect(result.forgeScore).toBeGreaterThanOrEqual(500); // realistic score
    expect(result.consistencyIndex).toBeGreaterThan(0);
    expect(result.peakWindows).toBeDefined();
  });
});
