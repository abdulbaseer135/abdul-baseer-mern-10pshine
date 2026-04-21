const express = require('express');
const router = express.Router();
const { signup, loginUser, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, signupSchema, loginSchema } = require('../middleware/validate.middleware');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;