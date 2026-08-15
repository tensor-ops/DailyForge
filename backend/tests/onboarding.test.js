const { updateProfileSchema } = require('../src/validators/user.validator');

describe('Onboarding Validator Unit Tests', () => {
  test('should validate valid preferences successfully', () => {
    const validPayload = {
      body: {
        preferences: {
          theme: 'dark',
          emailNotifications: true,
          focusAreas: ['Study', 'Career'],
          dailyCommitment: '60 minutes',
          goals: ['Consistency', 'Focus'],
        }
      }
    };
    
    const result = updateProfileSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    expect(result.data.body.preferences.focusAreas).toEqual(['Study', 'Career']);
    expect(result.data.body.preferences.dailyCommitment).toBe('60 minutes');
    expect(result.data.body.preferences.goals).toEqual(['Consistency', 'Focus']);
  });

  test('should fail when focusAreas is not an array', () => {
    const invalidPayload = {
      body: {
        preferences: {
          focusAreas: 'Study' // Should be array
        }
      }
    };
    
    const result = updateProfileSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  test('should fail when goals array contains non-string items', () => {
    const invalidPayload = {
      body: {
        preferences: {
          goals: [123, 'Focus'] // Should be strings only
        }
      }
    };
    
    const result = updateProfileSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
