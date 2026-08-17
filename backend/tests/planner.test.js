const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../src/config/env');
const User = require('../src/models/User');
const plannerService = require('../src/services/planner.service');

jest.mock('../src/models/User');
jest.mock('../src/services/planner.service');

describe('Planner & Calendar Domain Integration Tests', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const token = jwt.sign({ id: userId, email: 'test_planner@dailyforge.test' }, config.jwtAccessSecret);

  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockResolvedValue({
      _id: userId,
      email: 'test_planner@dailyforge.test',
      name: 'Planner Tester',
      isVerified: true,
      toJSON: function () {
        return this;
      },
    });
  });

  test('POST /api/v1/planner/events - should reject events missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/planner/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Missing title and date',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/v1/planner/events - should create scheduled calendar event', async () => {
    plannerService.createEvent.mockResolvedValue({
      events: [
        {
          id: 'evt-1',
          title: 'Deep Architecture Block',
          type: 'DEEP_WORK',
          startTime: '09:00',
          endTime: '11:00',
        },
      ],
      capacity: { scheduledMinutes: 120, targetCapacityMinutes: 360 },
    });

    const res = await request(app)
      .post('/api/v1/planner/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Deep Architecture Block',
        type: 'DEEP_WORK',
        date: '2026-08-17',
        startTime: '09:00',
        endTime: '11:00',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/v1/planner/events/:id/complete - should mark complete and return updated planner', async () => {
    const eventId = new mongoose.Types.ObjectId().toString();
    plannerService.completeEvent.mockResolvedValue({
      events: [
        {
          id: eventId,
          title: 'Deep Architecture Block',
          status: 'completed',
        },
      ],
    });

    const res = await request(app)
      .post(`/api/v1/planner/events/${eventId}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        focusQuality: 9,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
