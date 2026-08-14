const { daysDifference, formatDate, getPastDateStr } = require('../src/utils/dates');

describe('Streak Calculation Utilities Unit Tests', () => {
  test('formatDate should format current date as YYYY-MM-DD', () => {
    const formatted = formatDate(new Date('2026-08-14T10:00:00Z'));
    expect(formatted).toBe('2026-08-14');
  });

  test('daysDifference should calculate accurate difference in days', () => {
    const diff = daysDifference('2026-08-10', '2026-08-14');
    expect(diff).toBe(4);
  });

  test('getPastDateStr should return correct past date string', () => {
    const dateStr = getPastDateStr(5);
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
