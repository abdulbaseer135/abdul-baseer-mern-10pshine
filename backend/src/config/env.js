const path = require('node:path');
const os = require('node:os');

// On Vercel, env vars come from the dashboard — skip filesystem .env loading
if (!process.env.VERCEL) {
  require('dotenv').config();
}

/**
 * Read an env var with an optional default.
 * When required and missing, logs a clear message and throws.
 */
function getEnv(key, { required = false, defaultValue } = {}) {
  const value = process.env[key] ?? defaultValue;

  if (required && (value === undefined || value === null || value === '')) {
    const message =
      `Missing required environment variable: ${key}. ` +
      'Set it in your hosting environment (or your local .env).';
    console.error(`[env] ${message}`);
    throw new Error(message);
  }

  return value;
}

/**
 * Validate critical vars used by API/auth/DB.
 * Call from serverless entry or before connecting to MongoDB — not at import time —
 * so /health can still respond when config is incomplete.
 */
function assertRequiredEnv() {
  const missing = ['MONGO_URI', 'JWT_SECRET'].filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const message =
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
      'Set them in your hosting environment (or your local .env).';
    console.error(`[env] ${message}`);
    throw new Error(message);
  }

  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET.length < 32 || /replace-with|changeme|your-secret/i.test(process.env.JWT_SECRET)) {
      throw new Error('JWT_SECRET must be a strong random value of at least 32 characters in production');
    }
    for (const key of ['FRONTEND_URL', 'BACKEND_URL', ...(process.env.CLIENT_URL ? ['CLIENT_URL'] : [])]) {
      const values = (process.env[key] || '').split(',');
      if (key === 'BACKEND_URL' && values.length !== 1) throw new Error('BACKEND_URL must be one HTTPS origin');
      for (const value of values) {
        let url;
        try { url = new URL(value.trim()); } catch { throw new Error(`${key} must contain valid HTTPS origins`); }
        if (url.protocol !== 'https:' || url.origin !== value.trim()) {
          throw new Error(`${key} must contain HTTPS origins without paths or trailing slashes`);
        }
      }
    }
    if (!['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].every((key) => process.env[key])) {
      throw new Error('Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET for persistent production uploads');
    }
    const smtpConfigured = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'].every((key) => process.env[key]);
    if (!process.env.EMAIL_FROM || (!process.env.RESEND_API_KEY && !smtpConfigured)) {
      throw new Error('Configure EMAIL_FROM and either RESEND_API_KEY or complete SMTP credentials for production OTP delivery');
    }
  }
}

const FRONTEND_URL = getEnv('FRONTEND_URL', {
  defaultValue: 'http://localhost:3000',
});

module.exports = {
  PORT: Number(getEnv('PORT', { defaultValue: '5000' })) || 5000,
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', { defaultValue: '7d' }),
  NODE_ENV: getEnv('NODE_ENV', { defaultValue: 'development' }),
  LOG_LEVEL: getEnv('LOG_LEVEL', { defaultValue: 'info' }),
  FRONTEND_URL,
  CLIENT_URL: getEnv('CLIENT_URL', { defaultValue: FRONTEND_URL }),
  UPLOADS_PATH: getEnv('UPLOADS_PATH', {
    defaultValue: process.env.VERCEL
      ? path.join(os.tmpdir(), 'uploads')
      : path.join(__dirname, '../../uploads'),
  }),
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_SECURE: process.env.EMAIL_SECURE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
  assertRequiredEnv,
  getEnv,
};
