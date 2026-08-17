const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../src/config/env');
const User = require('../src/models/User');
const habitService = require('../src/services/habit.service');

jest.mock('../src/models/User');
jest.mock('../src/services/habit.service');

describe('Habit Domain Integration & Lifecycle Tests', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const token = jwt.sign({ id: userId, email: 'test_habit@dailyforge.test' }, config.jwtAccessSecret);

  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockResolvedValue({
      _id: userId,
      email: 'test_habit@dailyforge.test',
      name: 'Habit Tester',
      isVerified: true,
      toJSON: function () {
        return this;
      },
    });
  });

  test('POST /api/v1/habits - should reject creation if name is missing or too short', async () => {
    const res = await request(app)
      .post('/api/v1/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'A',
        category: 'Study',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/v1/habits - should create habit and return structured stats', async () => {
    const habitId = new mongoose.Types.ObjectId().toString();
    habitService.createHabit.mockResolvedValue({
      id: habitId,
      userId,
      name: 'Read 20 Pages',
      category: 'Study',
      trackingType: 'duration',
      frequency: 'daily',
      targetValue: 20,
      unit: 'pages',
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      completionRate: 0,
    });

    const res = await request(app)
      .post('/api/v1/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Read 20 Pages',
        category: 'Study',
        trackingType: 'duration',
        targetValue: 20,
        unit: 'pages',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Read 20 Pages');
  });

  test('DELETE /api/v1/habits/:id - should delete habit when authorized', async () => {
    const habitId = new mongoose.Types.ObjectId().toString();
    habitService.deleteHabit.mockResolvedValue({ id: habitId });

    const res = await request(app)
      .delete(`/api/v1/habits/${habitId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
