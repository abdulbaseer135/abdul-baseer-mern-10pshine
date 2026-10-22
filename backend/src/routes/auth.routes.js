const express = require('express');
const router = express.Router();
const { signup, loginUser, logout, getMe, sendOTPCode, verifyOTPHandler, resetUserPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, signupSchema, loginSchema } = require('../middleware/validate.middleware');
const { rateLimit } = require('express-rate-limit');
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: 'draft-8', legacyHeaders: false });
const otpLimiter = rateLimit({ windowMs: 60 * 1000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false });
router.use(authLimiter);

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// OTP routes
router.post('/send-otp', otpLimiter, sendOTPCode);
router.post('/verify-otp', otpLimiter, verifyOTPHandler);
router.post('/reset-password', resetUserPassword);

module.exports = router;
