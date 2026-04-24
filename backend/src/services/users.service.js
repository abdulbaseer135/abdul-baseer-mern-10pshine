const bcrypt = require('bcryptjs');
const { findById, updateUser, deleteUser } = require('../dal/users.dal');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const getProfile = async (userId) => {
  logger.info({ userId }, 'Fetching user profile');

  const user = await findById(userId);
  if (!user) {
    logger.warn({ userId }, 'Profile fetch failed — user not found');
    throw new ApiError(404, 'User not found');
  }

  logger.info({ userId }, 'Profile fetched successfully');
  return user;
};

const updateProfile = async (userId, updateData) => {
  logger.info({ userId, fields: Object.keys(updateData) }, 'Updating user profile');

  // prevent password and email update through this route
  delete updateData.password;
  delete updateData.email;

  const user = await updateUser(userId, updateData);
  if (!user) {
    logger.warn({ userId }, 'Profile update failed — user not found');
    throw new ApiError(404, 'User not found');
  }

  logger.info({ userId }, 'Profile updated successfully');
  return user;
};

const deleteProfile = async (userId) => {
  logger.info({ userId }, 'Deleting user account');

  const user = await deleteUser(userId);
  if (!user) {
    logger.warn({ userId }, 'Account deletion failed — user not found');
    throw new ApiError(404, 'User not found');
  }

  logger.info({ userId }, 'User account deleted successfully');
  return user;
};

const changePassword = async (userId, oldPassword, newPassword) => {
  logger.info({ userId }, 'Password change attempt');

  const user = await User.findById(userId).select('+password');
  if (!user) {
    logger.warn({ userId }, 'Password change failed — user not found');
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    logger.warn({ userId }, 'Password change failed — old password incorrect');
    throw new ApiError(401, 'Old password is incorrect');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  logger.info({ userId }, 'Password changed successfully');
};

module.exports = { getProfile, updateProfile, deleteProfile, changePassword };