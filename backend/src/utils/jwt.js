const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_ACCESS_SECRET || 'fallback_jwt_secret_key_2026';
const getExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

function generateAccessToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getExpiresIn(),
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
};
