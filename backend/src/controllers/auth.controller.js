const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { register, login } = require('../services/auth.service');

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await register({ name, email, password });

  return res
    .status(201)
    .json(new ApiResponse(201, result, 'User registered successfully'));
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
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'User fetched successfully'));
});

module.exports = { signup, loginUser, logout, getMe };