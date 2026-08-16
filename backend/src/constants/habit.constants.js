const HABIT_CATEGORIES = [
  'Health',
  'Fitness',
  'Study',
  'Work',
  'Personal',
  'Finance',
  'Mindfulness',
  'Creativity',
  'Other',
];

const HABIT_FREQUENCIES = [
  'daily',
  'weekdays',
  'weekends',
  'specific_days',
  'weekly',
  'custom',
];

const HABIT_TRACKING_TYPES = [
  'binary',
  'duration',
  'count',
  'quantity',
  'checklist',
];

const HABIT_DIFFICULTIES = ['easy', 'moderate', 'challenging'];

const HABIT_FRICTION_LEVELS = ['low', 'medium', 'high'];

const HABIT_STATUSES = ['active', 'archived'];

const INSIGHT_TYPES = [
  'pattern',
  'recommendation',
  'warning',
  'achievement',
  'prediction',
];

module.exports = {
  HABIT_CATEGORIES,
  HABIT_FREQUENCIES,
  HABIT_TRACKING_TYPES,
  HABIT_DIFFICULTIES,
  HABIT_FRICTION_LEVELS,
  HABIT_STATUSES,
  INSIGHT_TYPES,
};
