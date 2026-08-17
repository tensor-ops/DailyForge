const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../src/config/env');
const User = require('../src/models/User');
const todayService = require('../src/services/today.service');

jest.mock('../src/models/User');
jest.mock('../src/services/today.service');

describe('Today Cockpit & Idempotent Daily Review Tests', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const token = jwt.sign({ id: userId, email: 'test_review@dailyforge.test' }, config.jwtAccessSecret);

  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockResolvedValue({
      _id: userId,
      email: 'test_review@dailyforge.test',
      name: 'Review Tester',
      isVerified: true,
      toJSON: function () {
        return this;
      },
    });
  });

  test('POST /api/v1/today/review - should save daily review and return calculated forge note', async () => {
    const mockReview = {
      _id: new mongoose.Types.ObjectId().toString(),
      userId,
      date: '2026-08-17',
      rating: 'great',
      notes: 'Exceptional flow and completed all goals',
      completionPercentage: 100,
      completedItems: 5,
      totalItems: 5,
      focusMinutes: 120,
      forgeNote: 'You completed 100% of today commitments.',
    };

    todayService.submitDailyReview.mockResolvedValue(mockReview);

    const res = await request(app)
      .post('/api/v1/today/review')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-08-17',
        rating: 'great',
        notes: 'Exceptional flow and completed all goals',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe('great');
  });
});
