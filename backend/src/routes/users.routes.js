const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  deleteProfile,
  changePassword,             // ✅ added
} = require('../controllers/users.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, changePasswordSchema } = require('../middleware/validate.middleware');

router.use(protect); // all user routes are protected

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteProfile);
router.put('/change-password', validate(changePasswordSchema), changePassword); // ✅ added

module.exports = router;
