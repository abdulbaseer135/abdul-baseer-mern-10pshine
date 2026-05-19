const express = require('express');
const router = express.Router();
const { signup, loginUser, logout, getMe, sendOTPCode, verifyOTPHandler, resetUserPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, signupSchema, loginSchema } = require('../middleware/validate.middleware');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// OTP routes
router.post('/send-otp', sendOTPCode);
router.post('/verify-otp', verifyOTPHandler);
router.post('/reset-password', resetUserPassword);

module.exports = router;
