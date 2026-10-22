const fs = require('node:fs');
const os = require('node:os');
const multer = require('multer');
const path = require('node:path'); // Sonar: prefer node:path import
const ApiError = require('./ApiError');
const { UPLOADS_PATH } = require('../config/env');

const getUploadPath = () => {
  const basePath = UPLOADS_PATH || path.join(os.tmpdir(), 'uploads');
  return path.join(basePath, 'profiles');
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = getUploadPath();

    try {
      fs.mkdirSync(uploadPath, { recursive: true });
    } catch (err) {
      if (err.code === 'EACCES' || err.code === 'ENOENT') {
        uploadPath = path.join(os.tmpdir(), 'uploads', 'profiles');
        try {
          fs.mkdirSync(uploadPath, { recursive: true });
        } catch (fallbackErr) {
          return cb(fallbackErr);
        }
      } else {
        return cb(err);
      }
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const rawName = path.basename(file.originalname, ext);
    const safeName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) || 'profile';
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  },
});

// File filter - accept all image types by MIME type or file extension
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  const mimetype = typeof file.mimetype === 'string' ? file.mimetype.toLowerCase() : '';
  const ext = path.extname(file.originalname || '').toLowerCase();
  const isImageMime = ['image/jpeg', 'image/png', 'image/webp'].includes(mimetype);
  const isOctetStreamWithExt = mimetype === 'application/octet-stream' && allowedExtensions.includes(ext);
  const isImageExt = allowedExtensions.includes(ext);

  if (isImageExt && (isImageMime || isOctetStreamWithExt)) {
    cb(null, true);
  } else {
    cb(new Error(`Only image files are allowed. Received: ${file.mimetype || 'unknown MIME type'}`));
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
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
