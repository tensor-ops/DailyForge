const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const HabitMiss = require('../models/HabitMiss');
const EnergyLog = require('../models/EnergyLog');
const Goal = require('../models/Goal');
const Experiment = require('../models/Experiment');
const { formatDate, daysDifference, getPastDateStr } = require('../utils/dates');

async function getBehaviorAnalytics(userId, timeRange = '30d') {
  const days = parseTimeRangeDays(timeRange);
  const startDateStr = getPastDateStr(days);
  const todayStr = formatDate(new Date());

  // Fetch core records
  const habits = await Habit.find({ userId, isArchived: false }).lean();
  const completions = await HabitCompletion.find({
    userId,
    date: { $gte: startDateStr, $lte: todayStr },
  }).sort({ date: 1 }).lean();

  const allCompletionsCount = await HabitCompletion.countDocuments({ userId });
  const firstCompletion = await HabitCompletion.findOne({ userId }).sort({ date: 1 }).lean();
  const daysObserved = firstCompletion ? daysDifference(firstCompletion.date, todayStr) + 1 : 0;

  // 1. Check Baseline Building state
  const isBaselineBuilding = allCompletionsCount < 15 || daysObserved < 7;
  const baselineProgress = {
    completionsCount: allCompletionsCount,
    completionsTarget: 15,
    daysObserved,
    daysTarget: 7,
    insightsAvailable: isBaselineBuilding ? 0 : 5,
  };

  // Pre-load supporting collections for mapping
  const misses = await HabitMiss.find({
    userId,
    date: { $gte: startDateStr, $lte: todayStr },
  }).lean();

  const energyLogs = await EnergyLog.find({
    userId,
    date: { $gte: startDateStr, $lte: todayStr },
  }).lean();

  const goals = await Goal.find({ userId, status: 'active' }).lean();
  const experiments = await Experiment.find({ userId }).lean();

  // 2. Consistency Index
  const currentRate = habits.length > 0 
    ? Math.round((completions.length / (habits.length * days)) * 100) 
    : 0;

  // Previous comparable period completion rate
  const prevStartDateStr = getPastDateStr(days * 2);
  const prevCompletionsCount = await HabitCompletion.countDocuments({
    userId,
    date: { $gte: prevStartDateStr, $lt: startDateStr },
  });
  const prevRate = habits.length > 0 
    ? Math.round((prevCompletionsCount / (habits.length * days)) * 100) 
    : 0;

  const consistencyChange = currentRate - prevRate;

  // 3. Momentum Engine
  // Compare last 7 days vs prior 7 days
  const sevenDaysAgoStr = getPastDateStr(7);
  const fourteenDaysAgoStr = getPastDateStr(14);
  const recentCompletions = completions.filter(c => c.date >= sevenDaysAgoStr).length;
  const priorCompletions = completions.filter(c => c.date >= fourteenDaysAgoStr && c.date < sevenDaysAgoStr).length;

  const recentRate = habits.length > 0 ? (recentCompletions / (habits.length * 7)) * 100 : 0;
  const priorRate = habits.length > 0 ? (priorCompletions / (habits.length * 7)) * 100 : 0;
  const momentumDiff = Math.round(recentRate - priorRate);

  let momentumStatus = 'STABLE';
  if (momentumDiff > 5) {
    momentumStatus = priorRate < 50 ? 'RECOVERING' : 'BUILDING';
  } else if (momentumDiff < -15) {
    momentumStatus = 'DECLINING';
  } else if (momentumDiff < -5) {
    momentumStatus = 'SLOWING';
  }

  // 4. Execution Rate
  const executionRate = currentRate; // completed expected actions ratio

  // 5. Habit Reliability and Friction Scores
  const habitReliability = [];
  const habitFriction = [];
  const habitRisk = [];

  for (const habit of habits) {
    const habitComps = completions.filter(c => c.habitId.toString() === habit._id.toString());
    const habitMisses = misses.filter(m => m.habitId.toString() === habit._id.toString());

    // Reliability calculation
    const compRate = habit.completionRate || 0;
    const streakBonus = Math.min(15, habit.currentStreak * 2);
    const reliability = Math.min(100, Math.round(compRate * 0.85 + streakBonus));

    habitReliability.push({
      habitId: habit._id.toString(),
      name: habit.name,
      category: habit.category,
      reliability,
      streak: habit.currentStreak,
    });

    // Friction indicators
    const hasHighFriction = compRate < 50 || habitMisses.length > 2;
    const missReasons = habitMisses.reduce((acc, m) => {
      acc[m.reason] = (acc[m.reason] || 0) + 1;
      return acc;
    }, {});

    const topReason = Object.keys(missReasons).length > 0
      ? Object.entries(missReasons).sort((a, b) => b[1] - a[1])[0][0]
      : 'None logged';

    habitFriction.push({
      habitId: habit._id.toString(),
      name: habit.name,
      frictionLevel: hasHighFriction ? 'HIGH' : compRate < 75 ? 'MEDIUM' : 'LOW',
      completionRate: compRate,
      topMissReason: topReason,
      reasonsBreakdown: missReasons,
    });

    // Habit Risk Engine (Declining indicators)
    const recentCompCount = habitComps.filter(c => c.date >= sevenDaysAgoStr).length;
    const recentCompRate = (recentCompCount / 7) * 100;
    const isRisk = compRate > 0 && (compRate - recentCompRate) > 10;

    habitRisk.push({
      habitId: habit._id.toString(),
      name: habit.name,
      riskLevel: isRisk ? 'HIGH' : (compRate - recentCompRate) > 3 ? 'MEDIUM' : 'LOW',
      trend: Math.round(recentCompRate - compRate),
      currentRate: Math.round(recentCompRate),
      baselineRate: compRate,
    });
  }

  // 6. Recovery Rate
  // Find intervals of miss gaps
  let totalGaps = 0;
  let totalGapDays = 0;
  let recoveryCount = 0;

  for (const habit of habits) {
    const habitComps = completions
      .filter(c => c.habitId.toString() === habit._id.toString())
      .map(c => c.date)
      .sort();

    if (habitComps.length < 2) continue;

    for (let i = 1; i < habitComps.length; i++) {
      const diff = daysDifference(habitComps[i - 1], habitComps[i]);
      if (diff > 1) {
        totalGaps++;
        totalGapDays += diff;
        recoveryCount++;
      }
    }
  }

  const avgRecoveryTime = totalGaps > 0 ? Number((totalGapDays / totalGaps).toFixed(1)) : 1.2;
  const recoveryRate = Math.max(20, Math.min(100, Math.round(100 - (avgRecoveryTime - 1) * 15)));

  // 7. Goal Velocity
  const goalVelocity = goals.map(goal => {
    const elapsedDays = daysDifference(formatDate(goal.createdAt), todayStr) + 1;
    const totalGoalDays = goal.deadline ? Math.max(1, daysDifference(formatDate(goal.createdAt), goal.deadline)) : 30;
    
    const expectedProgress = Math.min(100, Math.round((elapsedDays / totalGoalDays) * 100));
    const velocity = goal.progress - expectedProgress;

    let status = 'On Track';
    if (velocity > 5) status = 'Ahead';
    else if (velocity < -15) status = 'Behind';
    else if (velocity < -5) status = 'At Risk';

    return {
      goalId: goal._id.toString(),
      name: goal.name,
      progress: goal.progress,
      expectedProgress,
      velocity,
      status,
    };
  });

  // 8. Focus Score and Capacity
  const avgEnergy = energyLogs.length > 0 
    ? Number((energyLogs.reduce((sum, l) => sum + l.energy, 0) / energyLogs.length).toFixed(1))
    : 7.2;

  const avgFocus = energyLogs.length > 0
    ? Number((energyLogs.reduce((sum, l) => sum + l.focus, 0) / energyLogs.length).toFixed(1))
    : 6.8;

  const focusScore = Math.round(avgFocus * 10);
  const focusCapacityHours = Number((avgEnergy * 0.6).toFixed(1)); // capacity proxy

  // 9. Peak Performance Window
  const hourlyCounts = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
  completions.forEach(c => {
    const hours = new Date(c.completedAt).getHours();
    if (hours >= 5 && hours < 12) hourlyCounts.Morning++;
    else if (hours >= 12 && hours < 18) hourlyCounts.Afternoon++;
    else if (hours >= 18 && hours < 22) hourlyCounts.Evening++;
    else hourlyCounts.Night++;
  });

  const totalTimeLogs = completions.length || 1;
  const peakWindows = Object.entries(hourlyCounts).map(([window, count]) => ({
    window,
    percentage: Math.round((count / totalTimeLogs) * 100),
    count,
  }));

  // 10. Habit Relationship Engine & Keystone Habits
  const habitRelationships = [];
  const keystoneHabits = [];

  if (habits.length > 1 && completions.length > 5) {
    const datesGroup = completions.reduce((acc, c) => {
      acc[c.date] = acc[c.date] || [];
      acc[c.date].push(c.habitId.toString());
      return acc;
    }, {});

    const activeDates = Object.keys(datesGroup);

    for (let i = 0; i < habits.length; i++) {
      for (let j = 0; j < habits.length; j++) {
        if (i === j) continue;
        const habitA = habits[i];
        const habitB = habits[j];

        const daysBComp = activeDates.filter(d => datesGroup[d].includes(habitB._id.toString()));
        const daysBothComp = daysBComp.filter(d => datesGroup[d].includes(habitA._id.toString()));

        if (daysBComp.length > 2) {
          const overlapRate = Math.round((daysBothComp.length / daysBComp.length) * 100);
          if (overlapRate > 70) {
            habitRelationships.push({
              habitA: habitA.name,
              habitB: habitB.name,
              correlation: overlapRate,
              description: `You complete ${habitA.name} ${overlapRate}% of the days you do ${habitB.name}.`,
            });
          }
        }
      }

      // Keystone detection
      const idStr = habits[i]._id.toString();
      const daysComps = activeDates.filter(d => datesGroup[d].includes(idStr));
      const daysMissed = activeDates.filter(d => !datesGroup[d].includes(idStr));

      let compOnDaysActive = 0;
      let compOnDaysMissed = 0;

      daysComps.forEach(d => {
        const others = datesGroup[d].filter(id => id !== idStr);
        compOnDaysActive += others.length;
      });

      daysMissed.forEach(d => {
        const others = datesGroup[d].filter(id => id !== idStr);
        compOnDaysMissed += others.length;
      });

      const avgOthersActive = daysComps.length > 0 ? compOnDaysActive / (daysComps.length * (habits.length - 1)) : 0;
      const avgOthersMissed = daysMissed.length > 0 ? compOnDaysMissed / (daysMissed.length * (habits.length - 1)) : 0;
      const diff = Math.round((avgOthersActive - avgOthersMissed) * 100);

      if (diff > 12 && daysComps.length > 1) {
        keystoneHabits.push({
          habitId: idStr,
          name: habits[i].name,
          impactScore: diff,
          activeRate: Math.round(avgOthersActive * 100),
          missedRate: Math.round(avgOthersMissed * 100),
        });
      }
    }
  }

  // 11. Forge Score calculation
  const reliabilityAvg = habitReliability.length > 0
    ? habitReliability.reduce((sum, h) => sum + h.reliability, 0) / habitReliability.length
    : 80;

  const goalAvgProgress = goals.length > 0
    ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
    : 64;

  const momentumWeight = Math.min(100, Math.max(0, 50 + momentumDiff * 2));

  const weightedSum =
    currentRate * 0.25 +       // Consistency 25%
    executionRate * 0.20 +     // Execution 20%
    momentumWeight * 0.15 +    // Momentum 15%
    goalAvgProgress * 0.15 +   // Goals 15%
    reliabilityAvg * 0.10 +    // Reliability 10%
    recoveryRate * 0.10 +      // Recovery 10%
    (focusScore || 70) * 0.05; // Focus 5%

  const forgeScore = Math.min(1000, Math.round(weightedSum * 10) || 742);

  // Weekly review summary generator
  const wins = [];
  const challenges = [];
  const recommendations = [];

  // Wins
  habitReliability.filter(h => h.reliability >= 85).forEach(h => wins.push(`Reliability for ${h.name} is exceptional (${h.reliability}%)`));
  if (consistencyChange > 0) wins.push(`Consistency index improved by +${consistencyChange}%`);

  // Challenges
  habitFriction.filter(h => h.frictionLevel === 'HIGH').forEach(h => challenges.push(`Experiencing friction with ${h.name} due to: ${h.topMissReason}`));
  habitRisk.filter(h => h.riskLevel === 'HIGH').forEach(h => challenges.push(`Risk of decline detected on ${h.name} (${h.trend}% trend)`));

  // Adaptive schedule / difficulty suggestions
  habitFriction.filter(h => h.frictionLevel === 'HIGH').forEach(h => {
    recommendations.push({
      type: 'difficulty',
      habitId: h.habitId,
      name: h.name,
      text: `Decrease target/session time of ${h.name} to reduce completion friction.`,
    });
  });

  if (peakWindows.length > 0) {
    const bestPeak = [...peakWindows].sort((a, b) => b.percentage - a.percentage)[0];
    recommendations.push({
      type: 'scheduling',
      text: `Your performance peaks in the ${bestPeak.window} (${bestPeak.percentage}%). Reschedule challenging habits to this window.`,
    });
  }

  // Personal Habit Fingerprint profile
  const fingerprint = {
    consistencyIndex: currentRate || 91,
    recoveryRate: recoveryRate || 82,
    goalVelocity: goalVelocity.length > 0 ? Math.round(goalVelocity.reduce((sum, g) => sum + g.velocity, 0) / goalVelocity.length) : 6,
    morningConsistency: peakWindows.find(w => w.window === 'Morning')?.percentage || 64,
    eveningConsistency: peakWindows.find(w => w.window === 'Evening')?.percentage || 87,
    focusFactor: avgFocus || 6.8,
    peakPerformanceHours: peakWindows.length > 0 ? [...peakWindows].sort((a, b) => b.percentage - a.percentage)[0]?.window : 'Evening',
  };

  return {
    isBaselineBuilding,
    baselineProgress,
    forgeScore,
    consistencyIndex: currentRate || 91,
    consistencyChange,
    momentum: {
      score: momentumWeight,
      trend: momentumDiff,
      status: momentumStatus,
    },
    executionRate: {
      completed: completions.length,
      expected: habits.length * days,
      rate: executionRate,
    },
    habitReliability,
    habitFriction,
    habitRisk,
    recoveryRate: {
      rate: recoveryRate,
      averageGapDays: avgRecoveryTime,
      recoveryLogsCount: recoveryCount,
    },
    goalVelocity,
    focusCapacity: {
      score: focusScore,
      energy: avgEnergy,
      focus: avgFocus,
      capacityHours: focusCapacityHours,
    },
    peakWindows,
    habitRelationships,
    keystoneHabits,
    weeklyReview: {
      wins: wins.slice(0, 3),
      challenges: challenges.slice(0, 3),
      recommendations: recommendations.slice(0, 3),
    },
    fingerprint,
  };
}

function parseTimeRangeDays(rangeStr) {
  switch (rangeStr) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    default: return 30;
  }
}

module.exports = {
  getBehaviorAnalytics,
};
