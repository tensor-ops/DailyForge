const User = require('../models/User');
const EmailVerificationCode = require('../models/EmailVerificationCode');
const { generateAccessToken } = require('../utils/jwt');
const { ConflictError, AuthenticationError, ValidationError } = require('../utils/errors');
const {
  generateSecureOtp,
  generateSalt,
  hashOtp,
  verifyOtpHash,
  normalizeEmail,
  maskEmail,
} = require('../utils/otp');
const emailService = require('./email/email.service');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Send an OTP verification email to the given address.
 * Enforces resend cooldown, hourly limits, and generates a cryptographically secure 6-digit code.
 */
async function sendOtp({ email, purpose = 'registration', ipAddress = '', userAgent = '' }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new ValidationError('A valid email address is required.');
  }

  const now = new Date();
  const resendCooldownMs = config.otp.resendSeconds * 1000;
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // 1. Check hourly rate limit per email
  const hourlyCount = await EmailVerificationCode.countDocuments({
    email: normalizedEmail,
    createdAt: { $gte: oneHourAgo },
  });

  if (hourlyCount >= config.otp.maxRequestsPerHour) {
    throw new ValidationError(
      'Too many verification requests. Please wait before requesting another code.'
    );
  }

  // 2. Check minimum resend cooldown
  const lastCode = await EmailVerificationCode.findOne({
    email: normalizedEmail,
    purpose,
  }).sort({ createdAt: -1 });

  if (lastCode && lastCode.lastSentAt) {
    const elapsedMs = now.getTime() - lastCode.lastSentAt.getTime();
    if (elapsedMs < resendCooldownMs) {
      const waitSeconds = Math.ceil((resendCooldownMs - elapsedMs) / 1000);
      throw new ValidationError(
        `Please wait ${waitSeconds}s before requesting a new verification code.`
      );
    }
  }

  // 3. Invalidate previous active unverified codes for this email and purpose
  await EmailVerificationCode.updateMany(
    {
      email: normalizedEmail,
      purpose,
      isVerified: false,
    },
    {
      $set: {
        expiresAt: new Date(now.getTime() - 1000), // Expire immediately
      },
    }
  );

  // 4. Generate cryptographically secure OTP & Hash
  const plainOtp = generateSecureOtp();
  const salt = generateSalt();
  const otpHash = hashOtp(plainOtp, salt);
  const expiresAt = new Date(now.getTime() + config.otp.expiryMinutes * 60 * 1000);

  // 5. Persist hashed OTP record
  const verificationRecord = new EmailVerificationCode({
    email: normalizedEmail,
    otpHash,
    salt,
    purpose,
    expiresAt,
    attemptCount: 0,
    maxAttempts: config.otp.maxAttempts,
    isVerified: false,
    lastSentAt: now,
    ipAddress,
    userAgent,
  });

  await verificationRecord.save();

  // 6. Dispatch email via configured email provider (Gmail API or Console)
  try {
    await emailService.sendOtpEmail({
      to: normalizedEmail,
      otp: plainOtp,
      expiresInMinutes: config.otp.expiryMinutes,
      purpose,
    });
  } catch (err) {
    // Delete the created record so user isn't locked out if email dispatch fails
    await EmailVerificationCode.deleteOne({ _id: verificationRecord._id });
    logger.error(`[AuthService] Email dispatch failed for ${normalizedEmail}:`, err.message);
    throw new ValidationError(
      "We couldn't send the verification email. Please try again shortly."
    );
  }

  return {
    maskedEmail: maskEmail(normalizedEmail),
    expiresInMinutes: config.otp.expiryMinutes,
    resendCooldownSeconds: config.otp.resendSeconds,
  };
}

/**
 * Verify a 6-digit OTP code, complete registration or login, and establish session JWT.
 */
async function verifyOtp({ email, otp, purpose = 'registration', name }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new ValidationError('A valid email address is required.');
  }

  const cleanOtp = (otp || '').trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    throw new ValidationError("That verification code isn't correct. Please try again.");
  }

  // 1. Locate the latest active verification record for this email
  const codeRecord = await EmailVerificationCode.findOne({
    email: normalizedEmail,
    purpose,
    isVerified: false,
  }).sort({ createdAt: -1 });

  if (!codeRecord) {
    throw new ValidationError('This code has expired. Request a new code to continue.');
  }

  // 2. Check expiration
  if (codeRecord.isExpired()) {
    throw new ValidationError('This code has expired. Request a new code to continue.');
  }

  // 3. Check attempt limit
  if (codeRecord.hasExceededAttempts()) {
    throw new ValidationError('Too many attempts. Please request a new verification code.');
  }

  // 4. Verify OTP hash
  const isValid = verifyOtpHash(cleanOtp, codeRecord.otpHash, codeRecord.salt);

  if (!isValid) {
    codeRecord.attemptCount += 1;
    await codeRecord.save();

    if (codeRecord.hasExceededAttempts()) {
      throw new ValidationError('Too many attempts. Please request a new verification code.');
    }

    throw new ValidationError("That verification code isn't correct. Please try again.");
  }

  // 5. Mark verification complete
  codeRecord.isVerified = true;
  codeRecord.verifiedAt = new Date();
  await codeRecord.save();

  // 6. Create or Authenticate User
  let user = await User.findOne({ email: normalizedEmail });
  let isNewUser = false;

  if (user) {
    // Existing user login
    user.emailVerified = true;
    user.emailVerifiedAt = user.emailVerifiedAt || new Date();
    user.lastLoginAt = new Date();
    await user.save();
  } else {
    // New user registration
    isNewUser = true;
    const displayName = (name && name.trim()) || normalizedEmail.split('@')[0];
    
    user = new User({
      name: displayName,
      email: normalizedEmail,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      authProvider: 'email_otp',
      lastLoginAt: new Date(),
    });

    await user.save();
  }

  // 7. Generate JWT session token
  const token = generateAccessToken({ id: user._id.toString(), email: user.email });

  return {
    user,
    token,
    isNewUser,
  };
}

/**
 * Resend an OTP code (re-invokes sendOtp).
 */
async function resendOtp(params) {
  return sendOtp(params);
}

// -------------------------------------------------------------
// Legacy Password-Based Methods (Preserved for backwards compatibility)
// -------------------------------------------------------------
async function registerUser({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  const user = new User({
    name,
    email: normalizedEmail,
    passwordHash: password,
    authProvider: 'password',
    emailVerified: false,
  });

  await user.save();

  const token = generateAccessToken({ id: user._id.toString(), email: user.email });

  return {
    user,
    token,
  };
}

async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthenticationError('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateAccessToken({ id: user._id.toString(), email: user.email });

  return {
    user,
    token,
  };
}

async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AuthenticationError('User not found');
  }
  return user;
}

module.exports = {
  sendOtp,
  verifyOtp,
  resendOtp,
  registerUser,
  loginUser,
  getCurrentUser,
};
