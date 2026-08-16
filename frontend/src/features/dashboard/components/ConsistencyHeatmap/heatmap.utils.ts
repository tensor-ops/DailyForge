import { Habit } from '@/types/habit';
import {
  HeatmapRange,
  HeatmapWeek,
  ConsistencyDay,
  ConsistencyLevel,
  HeatmapMonthLabel,
  HeatmapStats,
  HabitOccurrence,
} from './heatmap.types';

export const formatDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseDateStr = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const getRangeWeeksCount = (range: HeatmapRange): number => {
  switch (range) {
    case '12W':
      return 12;
    case '6M':
      return 26;
    case '1Y':
      return 52;
    default:
      return 12;
  }
};

/**
 * Checks if a habit is scheduled on a given date based on frequency and startDate.
 */
export const isHabitScheduledOnDate = (habit: Habit, date: Date, dateStr: string): boolean => {
  // If habit was created after this date, it wasn't active
  if (habit.startDate && habit.startDate > dateStr) {
    return false;
  }

  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'custom':
      return Array.isArray(habit.customDays) && habit.customDays.includes(dayOfWeek);
    default:
      return true;
  }
};

/**
 * Maps completion percentage to ConsistencyLevel (0-5 or -1 for NO_DATA).
 */
export const getConsistencyLevel = (scheduled: number, percentage: number): ConsistencyLevel => {
  if (scheduled === 0) return -1;
  if (percentage === 0) return 0;
  if (percentage < 25) return 1;
  if (percentage < 50) return 2;
  if (percentage < 75) return 3;
  if (percentage < 100) return 4;
  return 5;
};

/**
 * Builds the 7-day x N-week matrix ending at the current week's Sunday.
 */
export const buildHeatmapMatrix = (
  habits: Habit[],
  range: HeatmapRange,
  referenceDate = new Date()
): HeatmapWeek[] => {
  const numWeeks = getRangeWeeksCount(range);
  const todayStr = formatDateStr(referenceDate);

  // Normalize reference date to end of day
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  // Find end of current week (Sunday)
  // In JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  const currentDayOfWeek = ref.getDay();
  const daysUntilSunday = currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek;
  const endSunday = new Date(ref);
  endSunday.setDate(ref.getDate() + daysUntilSunday);

  // Start date is numWeeks before endSunday
  const totalDays = numWeeks * 7;
  const startDate = new Date(endSunday);
  startDate.setDate(endSunday.getDate() - totalDays + 1);

  const activeHabits = habits.filter((h) => !h.isArchived);

  // If no habits exist, generate an empty matrix
  const weeks: HeatmapWeek[] = [];

  for (let w = 0; w < numWeeks; w++) {
    const weekDays: ConsistencyDay[] = [];
    let weekTotalPercent = 0;
    let weekValidDays = 0;

    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + d;
      const currentCellDate = new Date(startDate);
      currentCellDate.setDate(startDate.getDate() + dayOffset);

      const dateStr = formatDateStr(currentCellDate);
      const isToday = dateStr === todayStr;
      const isFuture = currentCellDate > ref;
      const dayOfWeek = currentCellDate.getDay();
      // Convert Sunday(0) to 6, Monday(1) to 0, ... Saturday(6) to 5 for Monday-first rows
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const habitOccurrences: HabitOccurrence[] = [];
      let scheduledCount = 0;
      let completedCount = 0;

      if (!isFuture && activeHabits.length > 0) {
        for (const habit of activeHabits) {
          const isScheduled = isHabitScheduledOnDate(habit, currentCellDate, dateStr);
          if (isScheduled) {
            scheduledCount++;
            const isCompleted = isToday
              ? Boolean(habit.completedToday || habit.history?.[dateStr])
              : Boolean(habit.history?.[dateStr]);

            if (isCompleted) {
              completedCount++;
            }

            habitOccurrences.push({
              id: habit.id,
              name: habit.name,
              category: habit.category,
              color: habit.color,
              completed: isCompleted,
            });
          }
        }
      }

      const percentage =
        scheduledCount > 0 ? Math.min(100, Math.round((completedCount / scheduledCount) * 100)) : 0;
      const level = isFuture ? -1 : getConsistencyLevel(scheduledCount, percentage);

      if (!isFuture && scheduledCount > 0) {
        weekTotalPercent += percentage;
        weekValidDays++;
      }

      weekDays.push({
        date: dateStr,
        dateObj: currentCellDate,
        dayOfWeek,
        dayIndex,
        completed: completedCount,
        scheduled: scheduledCount,
        percentage,
        level,
        isToday,
        isFuture,
        isCurrentStreak: false,
        habits: habitOccurrences,
      });
    }

    // Sort days in week by dayIndex (0 = Monday ... 6 = Sunday)
    weekDays.sort((a, b) => a.dayIndex - b.dayIndex);

    weeks.push({
      weekIndex: w,
      days: weekDays,
      weekStartDate: weekDays[0].date,
      weekEndDate: weekDays[6].date,
      avgPercentage: weekValidDays > 0 ? Math.round(weekTotalPercent / weekValidDays) : 0,
    });
  }

  // Tag current streak days
  tagCurrentStreak(weeks);

  return weeks;
};

/**
 * Identifies and flags consecutive active days leading to today/yesterday.
 */
function tagCurrentStreak(weeks: HeatmapWeek[]) {
  const allDays = weeks.flatMap((w) => w.days).filter((d) => !d.isFuture);
  allDays.sort((a, b) => b.date.localeCompare(a.date)); // newest first

  let inStreak = true;
  for (const day of allDays) {
    if (!inStreak) break;
    if (day.isToday && day.completed === 0) {
      // Today not completed yet shouldn't break streak if yesterday was completed
      continue;
    }
    if (day.scheduled > 0 && day.completed > 0 && day.percentage >= 50) {
      day.isCurrentStreak = true;
    } else if (day.scheduled > 0) {
      inStreak = false;
    }
  }
}

/**
 * Computes Month header labels and column positions.
 */
export const calculateMonthLabels = (weeks: HeatmapWeek[]): HeatmapMonthLabel[] => {
  const labels: HeatmapMonthLabel[] = [];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  let currentMonth = '';
  let startCol = 0;
  let span = 0;

  weeks.forEach((week, colIdx) => {
    // Check month of Wednesday (middle of week) or Monday
    const midDay = week.days[2] || week.days[0];
    const month = monthNames[midDay.dateObj.getMonth()];

    if (month !== currentMonth) {
      if (currentMonth && span >= 2) {
        labels.push({ month: currentMonth, colIndex: startCol, span });
      }
      currentMonth = month;
      startCol = colIdx;
      span = 1;
    } else {
      span++;
    }
  });

  if (currentMonth && span >= 1) {
    labels.push({ month: currentMonth, colIndex: startCol, span });
  }

  return labels;
};

/**
 * Derives analytical summaries from the heatmap matrix.
 */
export const calculateHeatmapStats = (
  weeks: HeatmapWeek[],
  fallbackConsistency = 84,
  fallbackStreak = 17,
  consistencyChange = 6.2
): HeatmapStats => {
  const pastDays = weeks
    .flatMap((w) => w.days)
    .filter((d) => !d.isFuture && d.scheduled > 0);

  if (pastDays.length === 0) {
    return {
      averageConsistency: fallbackConsistency,
      consistencyChange,
      currentStreak: fallbackStreak,
      totalCompleted: 0,
      totalScheduled: 0,
      bestDay: { dayName: 'Wednesday', percentage: 100 },
      bestWeek: null,
      improvementVs4Weeks: consistencyChange,
      hasSufficientData: false,
    };
  }

  const totalCompleted = pastDays.reduce((acc, d) => acc + d.completed, 0);
  const totalScheduled = pastDays.reduce((acc, d) => acc + d.scheduled, 0);
  const averageConsistency =
    totalScheduled > 0
      ? Math.round(pastDays.reduce((acc, d) => acc + d.percentage, 0) / pastDays.length)
      : fallbackConsistency;

  // Best Day of week
  const weekdayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekdayStats: Record<number, { sum: number; count: number }> = {};

  pastDays.forEach((d) => {
    if (!weekdayStats[d.dayIndex]) {
      weekdayStats[d.dayIndex] = { sum: 0, count: 0 };
    }
    weekdayStats[d.dayIndex].sum += d.percentage;
    weekdayStats[d.dayIndex].count++;
  });

  let bestDayIndex = 2; // default Wednesday
  let bestDayPercentage = 0;

  Object.entries(weekdayStats).forEach(([idxStr, data]) => {
    const idx = Number(idxStr);
    const avg = Math.round(data.sum / data.count);
    if (avg > bestDayPercentage) {
      bestDayPercentage = avg;
      bestDayIndex = idx;
    }
  });

  // Best Week
  let bestWeekObj: HeatmapStats['bestWeek'] = null;
  const completedWeeks = weeks.filter((w) =>
    w.days.some((d) => !d.isFuture && d.scheduled > 0)
  );

  if (completedWeeks.length > 0) {
    const sortedWeeks = [...completedWeeks].sort((a, b) => b.avgPercentage - a.avgPercentage);
    const topWeek = sortedWeeks[0];
    if (topWeek && topWeek.avgPercentage > 0) {
      const start = parseDateStr(topWeek.weekStartDate);
      const end = parseDateStr(topWeek.weekEndDate);
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      bestWeekObj = {
        rangeStr: `${startStr} – ${endStr}`,
        percentage: topWeek.avgPercentage,
      };
    }
  }

  // Improvement vs 4 weeks ago
  let improvementVs4Weeks = consistencyChange;
  if (completedWeeks.length >= 8) {
    const recent4 = completedWeeks.slice(-4);
    const prev4 = completedWeeks.slice(-8, -4);
    const recentAvg = recent4.reduce((sum, w) => sum + w.avgPercentage, 0) / 4;
    const prevAvg = prev4.reduce((sum, w) => sum + w.avgPercentage, 0) / 4;
    improvementVs4Weeks = Number((recentAvg - prevAvg).toFixed(1));
  }

  // Streak count
  const streakCount = pastDays.filter((d) => d.isCurrentStreak).length || fallbackStreak;

  return {
    averageConsistency,
    consistencyChange,
    currentStreak: streakCount,
    totalCompleted,
    totalScheduled,
    bestDay: {
      dayName: weekdayNames[bestDayIndex] || 'Wednesday',
      percentage: bestDayPercentage || 100,
    },
    bestWeek: bestWeekObj,
    improvementVs4Weeks,
    hasSufficientData: pastDays.length >= 3,
  };
};
