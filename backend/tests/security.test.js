const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../src/config/env');
const User = require('../src/models/User');
const Goal = require('../src/models/Goal');

jest.mock('../src/models/Goal');
jest.mock('../src/models/User');

describe('Security, IDOR & Authorization Hardening Tests', () => {
  const userA_Id = new mongoose.Types.ObjectId().toString();
  const userB_Id = new mongoose.Types.ObjectId().toString();

  const tokenUserA = jwt.sign({ id: userA_Id, email: 'userA@dailyforge.test' }, config.jwtAccessSecret);
  const tokenUserB = jwt.sign({ id: userB_Id, email: 'userB@dailyforge.test' }, config.jwtAccessSecret);

  const goalOwnedByA = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockImplementation((id) => {
      if (id.toString() === userA_Id) {
        return Promise.resolve({ _id: userA_Id, email: 'userA@dailyforge.test', name: 'User A', isVerified: true, toJSON: function () { return this; } });
      }
      return Promise.resolve({ _id: userB_Id, email: 'userB@dailyforge.test', name: 'User B', isVerified: true, toJSON: function () { return this; } });
    });
  });

  test('SECURITY IDOR: User B cannot delete or modify Goal owned by User A', async () => {
    Goal.findOneAndDelete.mockImplementation((query) => {
      if (query.userId.toString() === userA_Id && query._id.toString() === goalOwnedByA) {
        return Promise.resolve({ _id: goalOwnedByA, userId: userA_Id, name: 'Goal A' });
      }
      return Promise.resolve(null);
    });

    const res = await request(app)
      .delete(`/api/v1/goals/${goalOwnedByA}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('SECURITY AUTH: Unauthenticated requests to protected endpoints fail with 401', async () => {
    const res = await request(app).get('/api/v1/habits');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('SECURITY INJECTION: Malformed NoSQL payloads are rejected', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({
        email: { $gt: '' },
        code: 123456,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
