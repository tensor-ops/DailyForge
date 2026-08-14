const { z } = require('zod');
const { HABIT_CATEGORIES, HABIT_FREQUENCIES } = require('../constants/habit.constants');

const createHabitSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().optional(),
    category: z.enum(HABIT_CATEGORIES).optional(),
    icon: z.string().optional(),
    frequency: z.enum(HABIT_FREQUENCIES).optional(),
    customDays: z.array(z.number().min(0).max(6)).optional(),
    targetValue: z.number().positive().optional(),
    unit: z.string().optional(),
    reminderTime: z.string().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    color: z.string().optional(),
  }),
});

const updateHabitSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    category: z.enum(HABIT_CATEGORIES).optional(),
    icon: z.string().optional(),
    frequency: z.enum(HABIT_FREQUENCIES).optional(),
    customDays: z.array(z.number().min(0).max(6)).optional(),
    targetValue: z.number().positive().optional(),
    unit: z.string().optional(),
    reminderTime: z.string().optional(),
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

module.exports = {
  createHabitSchema,
  updateHabitSchema,
  completeHabitSchema,
};
