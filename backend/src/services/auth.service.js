const jwt = require('jsonwebtoken');
const { findByEmail, createUser } = require('../dal/users.dal');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const logger = require('../config/logger');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const register = async ({ name, email, password }) => {
  logger.info({ email }, 'User registration attempt');

  const existingUser = await findByEmail(email);
  if (existingUser) {
    logger.warn({ email }, 'Registration failed — email already in use');
    throw new ApiError(409, 'Email already in use');
  }

  const user = await createUser({ name, email, password });
  const token = generateToken(user._id);

  logger.info({ email, userId: user._id }, 'User registered successfully');

  return {
    user: { _id: user._id, name: user.name, email: user.email },
    token,
  };
};

const login = async ({ email, password }) => {
  logger.info({ email }, 'User login attempt');

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    logger.warn({ email }, 'Login failed — email not found');
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.warn({ email }, 'Login failed — incorrect password');
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);

  logger.info({ email, userId: user._id }, 'User logged in successfully');

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

module.exports = { register, login, generateToken };