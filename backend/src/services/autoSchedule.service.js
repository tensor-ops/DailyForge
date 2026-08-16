const CalendarEvent = require('../models/CalendarEvent');
const Habit = require('../models/Habit');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const { formatDate } = require('../utils/dates');

/**
 * Generate Auto Schedule Preview
 */
async function generateAutoSchedulePreview(userId, dateStr) {
  const date = dateStr || formatDate(new Date());

  const proposedEvents = [
    {
      title: 'Morning Run & Mobility',
      type: 'HEALTH',
      startTime: '07:00 AM',
      endTime: '07:45 AM',
      startMinutes: 420,
      endMinutes: 465,
      durationMinutes: 45,
      category: 'Fitness',
      color: '#10B981',
      goalTitle: 'Cardio Stamina Upgrade',
    },
    {
      title: 'DSA Practice',
      type: 'HABIT',
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      startMinutes: 540,
      endMinutes: 630,
      durationMinutes: 90,
      category: 'Study',
      color: '#F97316',
      goalTitle: 'Establish Coding System',
    },
    {
      title: 'Deep Work Coding Sprint',
      type: 'TASK',
      startTime: '11:00 AM',
      endTime: '01:00 PM',
      startMinutes: 660,
      endMinutes: 780,
      durationMinutes: 120,
      category: 'Work',
      color: '#3B82F6',
      goalTitle: 'Become ML Engineer',
    },
    {
      title: 'Project Development',
      type: 'TASK',
      startTime: '02:30 PM',
      endTime: '04:30 PM',
      startMinutes: 870,
      endMinutes: 990,
      durationMinutes: 120,
      category: 'Work',
      color: '#8B5CF6',
      goalTitle: 'Build FeedbackIQ',
    },
    {
      title: 'ML Study & Reading',
      type: 'LEARNING',
      startTime: '06:00 PM',
      endTime: '07:00 PM',
      startMinutes: 1080,
      endMinutes: 1140,
      durationMinutes: 60,
      category: 'Study',
      color: '#06B6D4',
      goalTitle: 'Become ML Engineer',
    },
    {
      title: 'Evening Reflection & Review',
      type: 'HABIT',
      startTime: '09:00 PM',
      endTime: '09:30 PM',
      startMinutes: 1260,
      endMinutes: 1290,
      durationMinutes: 30,
      category: 'Personal',
      color: '#F59E0B',
      goalTitle: 'General Consistency',
    },
  ];

  const changes = [
    { action: 'Optimized', item: 'DSA Practice moved to 9:00 AM peak focus window' },
    { action: 'Balanced', item: 'Work Sprint capped at 2h to preserve afternoon energy' },
    { action: 'Scheduled', item: 'Added ML Study in optimal 6:00 PM retention window' },
    { action: 'Protected', item: 'Reserved 30m evening buffer for End of Day reflection' },
  ];

  return {
    date,
    proposedEvents,
    changes,
    capacityBefore: '82%',
    capacityAfter: '76%',
    goalAlignmentBefore: '87%',
    goalAlignmentAfter: '96%',
  };
}

/**
 * Apply Auto-Schedule to persistent calendar
 */
async function applyAutoSchedule(userId, dateStr, proposedEvents) {
  const date = dateStr || formatDate(new Date());

  // Replace today's scheduled blocks with optimized schedule
  await CalendarEvent.deleteMany({ userId, date, status: 'scheduled' });

  await CalendarEvent.insertMany(
    proposedEvents.map((e) => ({
      ...e,
      userId,
      date,
      status: 'scheduled',
    }))
  );

  return { success: true, count: proposedEvents.length };
}

module.exports = {
  generateAutoSchedulePreview,
  applyAutoSchedule,
};
