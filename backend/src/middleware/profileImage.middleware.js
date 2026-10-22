const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const ApiError = require('../utils/ApiError');

const imageType = (buffer) => {
  if (buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) return 'image/png';
  if (buffer.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))) return 'image/jpeg';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
};

const prepareProfileImage = async (req, res, next) => {
  if (!req.file) return next();
  const filePath = req.file.path;
  try {
    const data = await fs.readFile(filePath);
    const type = imageType(data);
    if (!type || type !== req.file.mimetype) throw new ApiError(400, 'Upload a valid JPEG, PNG or WebP image');
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = crypto.createHash('sha256').update(`timestamp=${timestamp}${CLOUDINARY_API_SECRET}`).digest('hex');
      const body = new FormData();
      body.append('file', new Blob([data], { type }), req.file.filename);
      body.append('api_key', CLOUDINARY_API_KEY);
      body.append('timestamp', String(timestamp));
      body.append('signature', signature);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/image/upload`, {
        method: 'POST', body, signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || !result.secure_url?.startsWith('https://res.cloudinary.com/')) {
        throw new ApiError(502, 'Image storage is unavailable. Please try again.');
      }
      req.file.remoteUrl = result.secure_url;
      await fs.unlink(filePath);
    } else if (process.env.NODE_ENV === 'production') {
      throw new ApiError(503, 'Persistent image storage is not configured');
    }
    next();
  } catch (error) {
    await fs.unlink(filePath).catch(() => {});
    next(error);
  }
};
module.exports = { prepareProfileImage, imageType };
