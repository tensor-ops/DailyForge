const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const EmailVerificationCode = require('../src/models/EmailVerificationCode');
const {
  generateSecureOtp,
  generateSalt,
  hashOtp,
  verifyOtpHash,
  normalizeEmail,
  maskEmail,
} = require('../src/utils/otp');
const { generateOtpEmailContent } = require('../src/services/email/emailTemplate');
const emailService = require('../src/services/email/email.service');

jest.mock('../src/models/EmailVerificationCode');
jest.mock('../src/models/User');

describe('OTP Utilities Unit Tests', () => {
  test('generateSecureOtp generates 6-digit numeric string', () => {
    for (let i = 0; i < 50; i++) {
      const otp = generateSecureOtp();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
      const num = parseInt(otp, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThan(1000000);
    }
  });

  test('hashOtp and verifyOtpHash work with timing-safe verification', () => {
    const otp = '483921';
    const salt = generateSalt();
    const hash = hashOtp(otp, salt);

    expect(typeof hash).toBe('string');
    expect(hash).toHaveLength(64); // SHA-256 hex is 64 chars

    expect(verifyOtpHash(otp, hash, salt)).toBe(true);
    expect(verifyOtpHash('483922', hash, salt)).toBe(false);
    expect(verifyOtpHash('000000', hash, salt)).toBe(false);
    expect(verifyOtpHash('', hash, salt)).toBe(false);
  });

  test('normalizeEmail lowercases and trims properly', () => {
    expect(normalizeEmail('  PARTH@GMAIL.COM  ')).toBe('parth@gmail.com');
    expect(normalizeEmail('User.Name+Tag@Domain.Co')).toBe('user.name+tag@domain.co');
  });

  test('maskEmail obfuscates local part safely', () => {
    expect(maskEmail('parth@gmail.com')).toBe('p•••h@gmail.com');
    expect(maskEmail('a@b.com')).toBe('a@b.com');
    expect(maskEmail('john.doe@domain.com')).toBe('j••••••e@domain.com');
  });

  test('generateOtpEmailContent produces valid subject and HTML', () => {
    const template = generateOtpEmailContent({
      to: 'user@gmail.com',
      otp: '789123',
      expiresInMinutes: 5,
      purpose: 'registration',
    });

    expect(template.subject).toBe('Your DailyForge verification code');
    expect(template.plainText).toContain('789123');
    expect(template.plainText).toContain('5 minutes');
    expect(template.html).toContain('789123');
    expect(template.html).toContain('DAILY');
  });
});

describe('OTP Authentication Endpoints Integration Tests', () => {
  const testEmail = 'forger.test@gmail.com';
  let emailSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    emailSpy = jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValue({
      success: true,
      messageId: 'test-message-id',
    });
  });

  afterEach(() => {
    if (emailSpy) emailSpy.mockRestore();
  });

  test('POST /api/v1/auth/send-otp sends OTP and never exposes code in response', async () => {
    EmailVerificationCode.countDocuments.mockResolvedValue(0);
    EmailVerificationCode.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(null),
    });
    EmailVerificationCode.updateMany.mockResolvedValue({ modifiedCount: 0 });
    EmailVerificationCode.prototype.save = jest.fn().mockResolvedValue(true);

    const res = await request(app).post('/api/v1/auth/send-otp').send({
      email: testEmail.toUpperCase(),
      purpose: 'registration',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Verification code sent');
    expect(res.body.data.maskedEmail).toBeDefined();
    expect(res.body.data.expiresInMinutes).toBe(5);
    expect(res.body.data.otp).toBeUndefined(); // CRITICAL: Never leak OTP in response
    expect(emailSpy).toHaveBeenCalledTimes(1);
  });

  test('POST /api/v1/auth/send-otp enforces resend cooldown', async () => {
    EmailVerificationCode.countDocuments.mockResolvedValue(1);
    EmailVerificationCode.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue({
        lastSentAt: new Date(Date.now() - 10000), // sent 10s ago (cooldown is 60s)
      }),
    });

    const res = await request(app).post('/api/v1/auth/send-otp').send({
      email: testEmail,
      purpose: 'registration',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Please wait');
  });

  test('POST /api/v1/auth/verify-otp creates new user and returns JWT on valid OTP', async () => {
    const plainOtp = '654321';
    const salt = generateSalt();
    const otpHash = hashOtp(plainOtp, salt);
    const mockRecord = {
      _id: new mongoose.Types.ObjectId(),
      email: testEmail,
      otpHash,
      salt,
      purpose: 'registration',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attemptCount: 0,
      maxAttempts: 5,
      isVerified: false,
      isExpired: () => false,
      hasExceededAttempts: () => false,
      save: jest.fn().mockResolvedValue(true),
    };

    EmailVerificationCode.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockRecord),
    });

    User.findOne.mockResolvedValue(null); // New user
    User.prototype.save = jest.fn().mockResolvedValue(true);
    User.prototype._id = new mongoose.Types.ObjectId();
    User.prototype.toJSON = function () {
      return {
        id: this._id.toString(),
        name: 'Test Forger',
        email: testEmail,
        emailVerified: true,
      };
    };

    const res = await request(app).post('/api/v1/auth/verify-otp').send({
      email: testEmail,
      otp: plainOtp,
      purpose: 'registration',
      name: 'Test Forger',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.isNewUser).toBe(true);
    expect(mockRecord.isVerified).toBe(true);
  });

  test('POST /api/v1/auth/verify-otp rejects invalid OTP and increments attempt count', async () => {
    const plainOtp = '654321';
    const salt = generateSalt();
    const otpHash = hashOtp(plainOtp, salt);
    const mockRecord = {
      _id: new mongoose.Types.ObjectId(),
      email: testEmail,
      otpHash,
      salt,
      purpose: 'registration',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attemptCount: 0,
      maxAttempts: 5,
      isVerified: false,
      isExpired: () => false,
      hasExceededAttempts: () => false,
      save: jest.fn().mockResolvedValue(true),
    };

    EmailVerificationCode.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockRecord),
    });

    const res = await request(app).post('/api/v1/auth/verify-otp').send({
      email: testEmail,
      otp: '000000', // wrong OTP
      purpose: 'registration',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("That verification code isn't correct. Please try again.");
    expect(mockRecord.attemptCount).toBe(1);
  });

  test('POST /api/v1/auth/verify-otp rejects expired OTP', async () => {
    const mockRecord = {
      _id: new mongoose.Types.ObjectId(),
      email: testEmail,
      isExpired: () => true,
      hasExceededAttempts: () => false,
    };

    EmailVerificationCode.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockRecord),
    });

    const res = await request(app).post('/api/v1/auth/verify-otp').send({
      email: testEmail,
      otp: '123456',
      purpose: 'registration',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('expired');
  });

  test('POST /api/v1/auth/verify-otp rejects when max attempts exceeded', async () => {
    const mockRecord = {
      _id: new mongoose.Types.ObjectId(),
      email: testEmail,
      isExpired: () => false,
      hasExceededAttempts: () => true,
    };

    EmailVerificationCode.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockRecord),
    });

    const res = await request(app).post('/api/v1/auth/verify-otp').send({
      email: testEmail,
      otp: '123456',
      purpose: 'registration',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Too many attempts');
  });
});
