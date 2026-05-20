const bcrypt = require('bcryptjs');
const { findById, updateUser, deleteUser } = require('../dal/users.dal');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

// ✅ Same rule as frontend and auth.service.js
const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

/**
 * Format user object to ensure full image URLs
 */
const formatUserWithImageUrl = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : user;
  
  // Convert relative image paths to full URLs
  if (userObj.profileImage && !userObj.profileImage.startsWith('http')) {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    userObj.profileImage = `${baseUrl}${userObj.profileImage}`;
  }
  
  return userObj;
};

const getProfile = async (userId) => {
  logger.info({ userId }, 'Fetching user profile');

  const user = await findById(userId);
  if (!user) {
    logger.warn({ userId }, 'Profile fetch failed — user not found');
    throw new ApiError(404, 'User not found');
  }

  logger.info({ userId }, 'Profile fetched successfully');
  return formatUserWithImageUrl(user);
};

const updateProfile = async (userId, updateData) => {
  logger.info({ userId, fields: Object.keys(updateData) }, 'Updating user profile');

  delete updateData.password;
  delete updateData.email;

  const user = await updateUser(userId, updateData);
  if (!user) {
    logger.warn({ userId }, 'Profile update failed — user not found');
    throw new ApiError(404, 'User not found');
  }

  logger.info({ userId }, 'Profile updated successfully');
  return formatUserWithImageUrl(user);
};

const deleteProfile = async (userId) => {
  logger.info({ userId }, 'Deleting user account');

  const user = await deleteUser(userId);
  if (!user) {
    logger.warn({ userId }, 'Account deletion failed — user not found');
    throw new ApiError(404, 'User not found');
  }

  logger.info({ userId }, 'User account deleted successfully');
  return formatUserWithImageUrl(user);
};

const changePassword = async (userId, oldPassword, newPassword) => {
  logger.info({ userId }, 'Password change attempt');

  // ✅ Validate new password strength
  if (!PASSWORD_RULES.test(newPassword)) {
    logger.warn({ userId }, 'Password change failed — weak new password');
    throw new ApiError(400, 'New password must be at least 8 characters and include uppercase, lowercase, number, and special character (!@#$%^&*)');
  }

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

  user.password = newPassword; // ✅ pre-save hook hashes it once
  await user.save();

  logger.info({ userId }, 'Password changed successfully');
};

module.exports = { getProfile, updateProfile, deleteProfile, changePassword };