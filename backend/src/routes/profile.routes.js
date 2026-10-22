const express = require('express');
const router = express.Router();
const { uploadProfileImage, removeProfileImage } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../utils/upload');
const { prepareProfileImage } = require('../middleware/profileImage.middleware');

// All profile routes are protected
router.use(protect);

// Upload/update profile image
router.post('/upload-image', upload.single('profileImage'), handleUploadError, prepareProfileImage, uploadProfileImage);

// Remove profile image
router.delete('/remove-image', removeProfileImage);

module.exports = router;
