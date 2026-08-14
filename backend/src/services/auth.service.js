const User = require('../models/User');
const { generateAccessToken } = require('../utils/jwt');
const { ConflictError, AuthenticationError } = require('../utils/errors');

async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  const user = new User({
    name,
    email: email.toLowerCase(),
    passwordHash: password, // Pre-save hook hashes password
  });

  await user.save();

  const token = generateAccessToken({ id: user._id.toString(), email: user.email });

  return {
    user,
    token,
  };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
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
  registerUser,
  loginUser,
  getCurrentUser,
};
