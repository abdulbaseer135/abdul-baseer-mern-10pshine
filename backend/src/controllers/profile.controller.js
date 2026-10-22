const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const usersDal = require('../dal/users.dal');
const fs = require('node:fs');     // Sonar: prefer node:fs over fs
const path = require('node:path'); // Sonar: prefer node:path over path
const logger = require('../config/logger');

/**
 * Get the full image URL
 */
const getFullImageUrl = (req, filename) => {
  const configuredUrl = process.env.BACKEND_URL?.trim();
  if (configuredUrl) {
    return `${configuredUrl.replace(/\/+$/, '')}/uploads/profiles/${filename}`;
  }

  const forwardedProto = req.headers?.['x-forwarded-proto']?.split(',')[0]?.trim();
  const protocol = forwardedProto || req.protocol || 'http';
  const host = req.get?.('host') || req.headers?.host || 'localhost:5000';

  return `${protocol}://${host}/uploads/profiles/${filename}`;
};

/**
 * Upload profile image
 */
const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file provided');
  }

  const imageUrl = req.file.remoteUrl || getFullImageUrl(req, req.file.filename);
  const user = await usersDal.updateUser(req.user._id, { profileImage: imageUrl });

  logger.info({ userId: req.user._id, imageUrl }, 'Profile image uploaded successfully');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Profile image uploaded successfully'));
});

/**
 * Remove profile image
 */
const removeProfileImage = asyncHandler(async (req, res) => {
  const user = await usersDal.updateUser(req.user._id, { profileImage: null });

  logger.info({ userId: req.user._id }, 'Profile image removed successfully');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Profile image removed successfully'));
});

module.exports = { uploadProfileImage, removeProfileImage };
