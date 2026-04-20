const jwt = require('jsonwebtoken');
const { findByEmail, createUser } = require('../dal/users.dal');
const ApiError = require('../utils/ApiError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const register = async ({ name, email, password }) => {
  const existingUser = await findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, 'Email already in use');
  }

  const user = await createUser({ name, email, password });
  const token = generateToken(user._id);

  return {
    user: { _id: user._id, name: user.name, email: user.email },
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);

  return {
    user: { _id: user._id, name: user.name, email: user.email },
    token,
  };
};

module.exports = { register, login, generateToken };