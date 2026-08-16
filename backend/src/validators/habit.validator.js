const { z } = require('zod');
const {
  HABIT_CATEGORIES,
  HABIT_FREQUENCIES,
  HABIT_TRACKING_TYPES,
  HABIT_DIFFICULTIES,
  HABIT_FRICTION_LEVELS,
} = require('../constants/habit.constants');

const createHabitSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().max(500).optional(),
    category: z.enum(HABIT_CATEGORIES).optional(),
    icon: z.string().optional(),
    trackingType: z.enum(HABIT_TRACKING_TYPES).optional(),
    frequency: z.enum(HABIT_FREQUENCIES).optional(),
    customDays: z.array(z.number().min(0).max(6)).optional(),
    targetValue: z.number().positive().optional(),
    unit: z.string().optional(),
    preferredTime: z.string().optional(),
    timeWindowStart: z.string().optional(),
    timeWindowEnd: z.string().optional(),
    reminderEnabled: z.boolean().optional(),
    reminderTime: z.string().optional(),
    reminderDays: z.array(z.number().min(0).max(6)).optional(),
    difficulty: z.enum(HABIT_DIFFICULTIES).optional(),
    expectedFriction: z.enum(HABIT_FRICTION_LEVELS).optional(),
    checklistItems: z.array(z.string()).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
    color: z.string().optional(),
  }),
});

const updateHabitSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    category: z.enum(HABIT_CATEGORIES).optional(),
    icon: z.string().optional(),
    trackingType: z.enum(HABIT_TRACKING_TYPES).optional(),
    frequency: z.enum(HABIT_FREQUENCIES).optional(),
    customDays: z.array(z.number().min(0).max(6)).optional(),
    targetValue: z.number().positive().optional(),
    unit: z.string().optional(),
    preferredTime: z.string().optional(),
    timeWindowStart: z.string().optional(),
    timeWindowEnd: z.string().optional(),
    reminderEnabled: z.boolean().optional(),
    reminderTime: z.string().optional(),
    reminderDays: z.array(z.number().min(0).max(6)).optional(),
    difficulty: z.enum(HABIT_DIFFICULTIES).optional(),
    expectedFriction: z.enum(HABIT_FRICTION_LEVELS).optional(),
    checklistItems: z.array(z.string()).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    color: z.string().optional(),
    isArchived: z.boolean().optional(),
  }),
});

const completeHabitSchema = z.object({
  params: z.object({
    habitId: z.string().min(1),
  }),
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    notes: z.string().optional(),
  }),
});

const logMissSchema = z.object({
  params: z.object({
    habitId: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().min(1, 'Reason is required'),
    notes: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
});

module.exports = {
  createHabitSchema,
  updateHabitSchema,
  completeHabitSchema,
  logMissSchema,
};
