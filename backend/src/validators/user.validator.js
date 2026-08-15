const { z } = require('zod');

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    avatarUrl: z.string().url().or(z.literal('')).optional(),
    timezone: z.string().optional(),
    preferences: z
      .object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
        accentTheme: z.enum(['midnight', 'arctic', 'indigo', 'emerald', 'ember', 'rose']).optional(),
        emailNotifications: z.boolean().optional(),
        dailyReminderTime: z.string().optional(),
        aiInsightsEnabled: z.boolean().optional(),
        weeklyReportEnabled: z.boolean().optional(),
        focusAreas: z.array(z.string()).optional(),
        dailyCommitment: z.string().optional(),
        goals: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

module.exports = {
  updateProfileSchema,
};
