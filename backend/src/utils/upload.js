const multer = require('multer');
const path = require('node:path'); // Sonar: prefer node:path import
const ApiError = require('./ApiError');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/profiles'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter - accept all image types by MIME type or file extension
const fileFilter = (req, file, cb) => {
  // List of allowed image extensions
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif', '.heic', '.heif', '.ico', '.avif', '.jp2'];
  
  // Check both MIME type and file extension for maximum compatibility
  const isImageMime = file.mimetype?.toLowerCase().includes('image'); // Sonar: optional chaining
  const ext = path.extname(file.originalname).toLowerCase();
  const isImageExt = allowedExtensions.includes(ext);
  
  if (isImageMime || isImageExt) {
    cb(null, true);
  } else {
    // Reject the file
    cb(new Error(`Only image files are allowed. Received: ${file.mimetype || 'unknown MIME type'}`));
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware to handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(new ApiError(400, 'File size must not exceed 5MB'));
    }
    return res.status(400).json(new ApiError(400, err.message));
  }
  if (err) {
    return res.status(400).json(new ApiError(400, err.message || 'Upload failed'));
  }
  next();
};

module.exports = { upload, handleUploadError };
