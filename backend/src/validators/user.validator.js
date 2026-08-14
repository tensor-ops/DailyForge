const { z } = require('zod');

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    avatarUrl: z.string().url().or(z.literal('')).optional(),
    timezone: z.string().optional(),
    preferences: z
      .object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
        emailNotifications: z.boolean().optional(),
        dailyReminderTime: z.string().optional(),
        aiInsightsEnabled: z.boolean().optional(),
        weeklyReportEnabled: z.boolean().optional(),
      })
      .optional(),
  }),
});

module.exports = {
  updateProfileSchema,
};
