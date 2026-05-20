const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { register, login, sendOTP, verifyOTPCode, resetPassword } = require('../services/auth.service');
const ApiError = require('../utils/ApiError');

/**
 * Format user with full image URL
 */
const formatUserResponse = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : { ...user };
  
  // Convert relative image paths to full URLs
  if (userObj.profileImage && !userObj.profileImage.startsWith('http')) {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    userObj.profileImage = `${baseUrl}${userObj.profileImage}`;
  }
  
  return userObj;
};

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await register({ name, email, password });

  return res
    .status(201)
    .json(new ApiResponse(201, result, 'User registered successfully. Check email for OTP.'));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await login({ email, password });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Login successful'));
});

const logout = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

const getMe = asyncHandler(async (req, res) => {
  const formattedUser = formatUserResponse(req.user);
  
  return res
    .status(200)
    .json(new ApiResponse(200, formattedUser, 'User fetched successfully'));
});

const sendOTPCode = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;
  
  if (!email || !purpose) {
    throw new ApiError(400, 'Email and purpose are required');
  }

  await sendOTP(email, purpose);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'OTP sent successfully'));
});

const verifyOTPHandler = asyncHandler(async (req, res) => {
  const { email, otp, purpose } = req.body;
  
  if (!email || !otp || !purpose) {
    throw new ApiError(400, 'Email, OTP, and purpose are required');
  }

  await verifyOTPCode(email, otp, purpose);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'OTP verified successfully'));
});

const resetUserPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  
  if (!email || !newPassword) {
    throw new ApiError(400, 'Email and new password are required');
  }

  await resetPassword(email, newPassword);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Password reset successfully'));
});

module.exports = { signup, loginUser, logout, getMe, sendOTPCode, verifyOTPHandler, resetUserPassword };