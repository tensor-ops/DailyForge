const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../src/config/env');
const User = require('../src/models/User');
const Goal = require('../src/models/Goal');

jest.mock('../src/models/Goal');
jest.mock('../src/models/User');

describe('Goal Domain Integration Tests', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const token = jwt.sign({ id: userId, email: 'test_goal@dailyforge.test' }, config.jwtAccessSecret);

  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockResolvedValue({
      _id: userId,
      email: 'test_goal@dailyforge.test',
      name: 'Goal Tester',
      isVerified: true,
      toJSON: function () {
        return this;
      },
    });
  });

  test('POST /api/v1/goals - should reject invalid goal payload without name', async () => {
    const res = await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'No title provided',
        category: 'Career',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/v1/goals - should create a valid goal with milestone roadmap', async () => {
    const goalId = new mongoose.Types.ObjectId().toString();
    const mockGoal = {
      _id: goalId,
      userId,
      name: 'Master System Design',
      category: 'Career',
      priority: 'high',
      progress: 0,
      velocity: 3,
      status: 'ON_TRACK',
      milestones: [
        { _id: new mongoose.Types.ObjectId().toString(), title: 'Study Raft Paper', weight: 5, status: 'pending' },
      ],
      habits: [],
      tasks: [],
      toJSON: function () {
        return this;
      },
      save: jest.fn().mockResolvedValue(true),
    };

    Goal.prototype.save = jest.fn().mockResolvedValue(mockGoal);
    Goal.findOne.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockGoal),
        }),
      }),
    });

    const res = await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Master System Design',
        category: 'Career',
        priority: 'high',
        targetValue: 100,
        unit: '%',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Master System Design');
  });

  test('DELETE /api/v1/goals/:id - should delete goal when owned by user', async () => {
    const goalId = new mongoose.Types.ObjectId().toString();
    Goal.findOneAndDelete.mockResolvedValue({ _id: goalId, userId });

    const res = await request(app)
      .delete(`/api/v1/goals/${goalId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
