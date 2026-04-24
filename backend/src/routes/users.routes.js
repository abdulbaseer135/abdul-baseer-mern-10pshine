const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  deleteProfile,
  changePassword,             // ✅ added
} = require('../controllers/users.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // all user routes are protected

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteProfile);
router.put('/change-password', changePassword); // ✅ added

module.exports = router;