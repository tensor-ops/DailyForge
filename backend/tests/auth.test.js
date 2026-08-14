const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Auth & Health Endpoints Integration Tests', () => {
  test('GET /health should return 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  test('POST /api/v1/auth/register should fail on validation error', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'A',
      email: 'invalid-email',
      password: '123',
      confirmPassword: '456',
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/v1/auth/login should return 401 when user is not found', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'WrongPassword123',
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');

    User.findOne.mockRestore();
  });
});
