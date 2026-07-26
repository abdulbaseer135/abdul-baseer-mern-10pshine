const jwt = require('jsonwebtoken');
const { findByEmail, createUser, findById, updateUser } = require('../dal/users.dal');
const {
  findDeletedByEmail,
  removeDeletedEmail,
} = require('../dal/deletedAccounts.dal');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const logger = require('../config/logger');
const { validateEmailFormat, validateEmailDomain } = require('../utils/emailValidation');
const { generateOTP, hashOTP, verifyOTP, getOTPExpiry } = require('../utils/otp');
const { sendOTPEmailNonBlocking } = require('../utils/nodemailer');

const DELETED_ACCOUNT_LOGIN_MESSAGE =
  'This account has been deleted. Please create a new account before signing in.';

// ✅ Password strength rule — same as frontend
const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

const generateToken = (userId) => {
  if (!JWT_SECRET) {
    console.error('[Auth] JWT_SECRET is not configured');
    throw new ApiError(500, 'Server misconfiguration: JWT_SECRET is missing');
  }
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
    // Unverified account: let them finish OTP instead of blocking with "already in use"
    if (!existingUser.isEmailVerified) {
      const otp = generateOTP();
      const otpHash = hashOTP(otp);

      // Update name/password so a new signup attempt can complete verification
      existingUser.name = name;
      existingUser.password = password;
      await existingUser.save();

      await updateUser(existingUser._id, {
        otp: {
          code: otpHash,
          expiresAt: getOTPExpiry(),
          purpose: 'verify',
        },
      });

      await sendOTPEmailNonBlocking(email, otp, 'verify');
      logger.info({ email, userId: existingUser._id }, 'Unverified user re-signup — OTP re-sent');

      // No access token until OTP is completed
      return {
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          isEmailVerified: false,
          profileImage: existingUser.profileImage,
          createdAt: existingUser.createdAt,
        },
        token: null,
        requiresVerification: true,
      };
    }

    logger.warn({ email }, 'Registration failed — email already in use');
    throw new ApiError(409, 'Email already in use');
  }

  const user = await createUser({ name, email, password, isEmailVerified: false });

  // Allow previously deleted emails to register again
  await removeDeletedEmail(email);

  // ✅ Persist OTP first, then send email without blocking the HTTP response
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

    // Gmail SMTP from Vercel is slow — don't make signup wait for full delivery
    await sendOTPEmailNonBlocking(email, otp, 'verify');
    logger.info({ email, userId: user._id }, 'User registered successfully, OTP dispatch started');
  } catch (emailError) {
    logger.error({ email, error: emailError.message }, 'OTP email failed during registration');
    // Don't throw - user is already created, they can request OTP again
  }

  // No access token until email OTP is verified
  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: false,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    },
    token: null,
    requiresVerification: true,
  };
};

const login = async ({ email, password }) => {
  logger.info({ email }, 'User login attempt');

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const deleted = await findDeletedByEmail(email);
    if (deleted) {
      logger.warn({ email }, 'Login failed — account was deleted');
      throw new ApiError(403, DELETED_ACCOUNT_LOGIN_MESSAGE);
    }
    logger.warn({ email }, 'Login failed — email not found');
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.warn({ email }, 'Login failed — incorrect password');
    throw new ApiError(401, 'Invalid email or password');
  }

  // Incomplete signup: account exists but OTP was never completed
  if (!user.isEmailVerified) {
    logger.warn({ email, userId: user._id }, 'Login blocked — email not verified');
    throw new ApiError(
      403,
      'Please verify your email with the OTP before signing in'
    );
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

  // Respond quickly on serverless; email continues in background when possible
  await sendOTPEmailNonBlocking(email, otp, purpose);
  logger.info({ email, purpose }, 'OTP dispatch started');
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
