const crypto = require('crypto');
const config = require('../config/env');

/**
 * Generate a cryptographically secure 6-digit numeric OTP string.
 * Range: 100000 - 999999
 * @returns {string} 6-digit OTP
 */
function generateSecureOtp() {
  const otpNumber = crypto.randomInt(100000, 1000000);
  return otpNumber.toString();
}

/**
 * Generate a random 16-byte hex salt for OTP hashing.
 * @returns {string} hex salt
 */
function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Hash an OTP using SHA-256 HMAC with salt and application pepper.
 * Never stores raw OTP in database.
 * @param {string} otp - The plain 6-digit OTP
 * @param {string} salt - Per-code salt
 * @returns {string} Hexadecimal hash
 */
function hashOtp(otp, salt) {
  const pepper = config.otp.pepperSecret;
  return crypto
    .createHmac('sha256', pepper)
    .update(`${otp}:${salt}`)
    .digest('hex');
}

/**
 * Verify a plain OTP against the stored hash in a timing-safe manner.
 * @param {string} plainOtp - OTP entered by user
 * @param {string} storedHash - Stored hash from database
 * @param {string} salt - Salt used when hashing
 * @returns {boolean} True if matching
 */
function verifyOtpHash(plainOtp, storedHash, salt) {
  if (!plainOtp || !storedHash || !salt) return false;
  const computedHash = hashOtp(plainOtp.trim(), salt);
  
  const computedBuf = Buffer.from(computedHash, 'hex');
  const storedBuf = Buffer.from(storedHash, 'hex');

  if (computedBuf.length !== storedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(computedBuf, storedBuf);
}

/**
 * Normalize and sanitize an email address.
 * @param {string} email
 * @returns {string}
 */
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Mask an email for user-facing displays to avoid leaking full addresses.
 * Example: parth.forge@gmail.com -> p••••••••e@gmail.com
 * @param {string} email
 * @returns {string} Masked email
 */
function maskEmail(email) {
  const normalized = normalizeEmail(email);
  const atIndex = normalized.indexOf('@');
  if (atIndex <= 1) return normalized;

  const userPart = normalized.substring(0, atIndex);
  const domainPart = normalized.substring(atIndex);

  if (userPart.length <= 2) {
    return `${userPart[0]}••••${domainPart}`;
  }

  const firstChar = userPart[0];
  const lastChar = userPart[userPart.length - 1];
  const maskedMiddle = '•'.repeat(Math.min(userPart.length - 2, 6));

  return `${firstChar}${maskedMiddle}${lastChar}${domainPart}`;
}

module.exports = {
  generateSecureOtp,
  generateSalt,
  hashOtp,
  verifyOtpHash,
  normalizeEmail,
  maskEmail,
};
