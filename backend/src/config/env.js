const path = require('node:path');
const os = require('node:os');
const { configurationError } = require('../utils/startupDiagnostics');

// On Vercel, env vars come from the dashboard — skip filesystem .env loading
if (!process.env.VERCEL) {
  // Always load the backend file, regardless of the shell's working directory.
  // Hosting environment variables retain precedence over the local file.
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
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
    throw configurationError(message, [key], 'missing');
  }

  return value;
}

/**
 * Validate critical vars used by API/auth/DB.
 * Call from serverless entry or before connecting to MongoDB — not at import time —
 * so /health can still respond when config is incomplete.
 */
function assertRequiredEnv() {
  const missing = ['MONGO_URI', 'JWT_SECRET'].filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    const message =
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
      'Set them in your hosting environment (or your local .env).';
    console.error(`[env] ${message}`);
    throw configurationError(message, missing, 'missing');
  }

  const port = Number(process.env.PORT ?? '5000');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw configurationError('PORT must be an integer from 1 to 65535', ['PORT'], 'invalid_format');
  }

  if (process.env.NODE_ENV === 'production') {
    if (!/^mongodb(?:\+srv)?:\/\/\S+$/.test(process.env.MONGO_URI)) {
      throw configurationError('MONGO_URI must use a MongoDB connection URI scheme without whitespace', ['MONGO_URI'], 'invalid_format');
    }
    if (process.env.JWT_SECRET.length < 32 || /replace-with|changeme|your-secret/i.test(process.env.JWT_SECRET)) {
      throw configurationError('JWT_SECRET must be a strong random value of at least 32 characters in production', ['JWT_SECRET'], 'weak_secret');
    }
    for (const key of ['FRONTEND_URL', 'BACKEND_URL', ...(process.env.CLIENT_URL ? ['CLIENT_URL'] : [])]) {
      const values = (process.env[key] || '').split(',');
      if (key === 'BACKEND_URL' && values.length !== 1) throw configurationError('BACKEND_URL must be one HTTPS origin', [key], 'invalid_format');
      for (const value of values) {
        let url;
        try { url = new URL(value.trim()); } catch { throw configurationError(`${key} must contain valid HTTPS origins`, [key], value.trim() ? 'invalid_format' : 'missing'); }
        if (url.protocol !== 'https:' || url.origin !== value.trim()) {
          throw configurationError(`${key} must contain HTTPS origins without paths or trailing slashes`, [key], 'invalid_format');
        }
      }
    }
    if (!['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].every((key) => process.env[key])) {
      throw configurationError('Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET for persistent production uploads', ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter((key) => !process.env[key]), 'missing');
    }
    const smtpConfigured = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'].every((key) => process.env[key]);
    if (!process.env.EMAIL_FROM || (!process.env.RESEND_API_KEY && !smtpConfigured)) {
      throw configurationError('Configure EMAIL_FROM and either RESEND_API_KEY or complete SMTP credentials for production OTP delivery', ['EMAIL_FROM', ...(!process.env.RESEND_API_KEY && !smtpConfigured ? ['RESEND_API_KEY', 'EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'] : [])].filter((key) => !process.env[key]), 'missing');
    }
  }
}

const FRONTEND_URL = getEnv('FRONTEND_URL', {
  defaultValue: 'http://localhost:3000',
});

module.exports = {
  PORT: Number(getEnv('PORT', { defaultValue: '5000' })),
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
