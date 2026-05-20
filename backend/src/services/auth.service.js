const jwt = require('jsonwebtoken');
const { findByEmail, createUser, findById, updateUser } = require('../dal/users.dal');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const logger = require('../config/logger');
const { validateEmailFormat, validateEmailDomain } = require('../utils/emailValidation');
const { generateOTP, hashOTP, verifyOTP, getOTPExpiry } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/nodemailer');

// ✅ Password strength rule — same as frontend
const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const register = async ({ name, email, password }) => {
  logger.info({ email }, 'User registration attempt');

  // ✅ Validate email format first
  if (!validateEmailFormat(email)) {
    logger.warn({ email }, 'Registration failed — invalid email format');
    throw new ApiError(400, 'Invalid email format');
  }

  // ✅ Validate email domain/MX records
  const isDomainValid = await validateEmailDomain(email);
  if (!isDomainValid) {
    logger.warn({ email }, 'Registration failed — invalid domain or cannot receive mail');
    throw new ApiError(400, 'Email domain is invalid or cannot receive mail');
  }

  // ✅ Validate password strength
  if (!PASSWORD_RULES.test(password)) {
    logger.warn({ email }, 'Registration failed — weak password');
    throw new ApiError(400, 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character (!@#$%^&*)');
  }

  const existingUser = await findByEmail(email);
  if (existingUser) {
    logger.warn({ email }, 'Registration failed — email already in use');
    throw new ApiError(409, 'Email already in use');
  }

  const user = await createUser({ name, email, password, isEmailVerified: false });
  const token = generateToken(user._id);

  // ✅ Send OTP email for verification
  try {
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    
    await updateUser(user._id, {
      otp: {
        code: otpHash,
        expiresAt: getOTPExpiry(),
        purpose: 'verify',
      },
    });

    await sendOTPEmail(email, otp, 'verify');
    logger.info({ email, userId: user._id }, 'User registered successfully, OTP sent');
  } catch (emailError) {
    logger.error({ email, error: emailError.message }, 'OTP email failed during registration');
    // Don't throw - user is already created, they can request OTP again
  }

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    },
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

  // Format image URL if exists
  let profileImage = user.profileImage;
  if (profileImage && !profileImage.startsWith('http')) {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    profileImage = `${baseUrl}${profileImage}`;
  }

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      profileImage,
      createdAt: user.createdAt,
    },
    token,
  };
};

const sendOTP = async (email, purpose) => {
  logger.info({ email, purpose }, 'Send OTP request');

  if (!validateEmailFormat(email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  const user = await findByEmail(email);
  if (!user) {
    throw new ApiError(404, 'Email not found');
  }

  // ✅ Validate purpose
  if (!['verify', 'reset'].includes(purpose)) {
    throw new ApiError(400, 'Invalid OTP purpose');
  }

  const otp = generateOTP();
  const otpHash = hashOTP(otp);

  await updateUser(user._id, {
    otp: {
      code: otpHash,
      expiresAt: getOTPExpiry(),
      purpose,
    },
  });

  await sendOTPEmail(email, otp, purpose);
  logger.info({ email, purpose }, 'OTP sent successfully');
};

const verifyOTPCode = async (email, otp, purpose) => {
  logger.info({ email, purpose }, 'Verify OTP request');

  if (!validateEmailFormat(email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  const user = await findByEmail(email);
  if (!user) {
    throw new ApiError(404, 'Email not found');
  }

  if (!user.otp.code || user.otp.purpose !== purpose) {
    throw new ApiError(400, 'No valid OTP found');
  }

  // ✅ Check if OTP is expired
  if (new Date() > user.otp.expiresAt) {
    throw new ApiError(400, 'OTP has expired');
  }

  // ✅ Verify OTP
  if (!verifyOTP(user.otp.code, otp)) {
    throw new ApiError(400, 'Invalid OTP');
  }

  // ✅ Clear OTP and update verification status if purpose is 'verify'
  const updateData = {
    otp: {
      code: null,
      expiresAt: null,
      purpose: null,
    },
  };

  if (purpose === 'verify') {
    updateData.isEmailVerified = true;
  }

  await updateUser(user._id, updateData);
  logger.info({ email, purpose }, 'OTP verified successfully');
};

const resetPassword = async (email, newPassword) => {
  logger.info({ email }, 'Password reset request');

  if (!validateEmailFormat(email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  if (!PASSWORD_RULES.test(newPassword)) {
    throw new ApiError(400, 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character (!@#$%^&*)');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(404, 'Email not found');
  }

  user.password = newPassword;
  await user.save(); // ✅ pre-save hook hashes it

  // ✅ Clear OTP after successful reset
  await updateUser(user._id, {
    otp: {
      code: null,
      expiresAt: null,
      purpose: null,
    },
  });

  logger.info({ email }, 'Password reset successfully');
};

module.exports = { register, login, generateToken, sendOTP, verifyOTPCode, resetPassword };
