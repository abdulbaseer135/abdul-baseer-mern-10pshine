const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const usersService = require('../services/users.service');

const getProfile = asyncHandler(async (req, res) => {
  const user = await usersService.getProfile(req.user._id);
  return res.status(200).json(new ApiResponse(200, user, 'Profile fetched successfully'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await usersService.updateProfile(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

const deleteProfile = asyncHandler(async (req, res) => {
  await usersService.deleteProfile(req.user._id);
  return res.status(200).json(new ApiResponse(200, null, 'Account deleted successfully'));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await usersService.changePassword(req.user._id, oldPassword, newPassword);
  return res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

module.exports = { getProfile, updateProfile, deleteProfile, changePassword };