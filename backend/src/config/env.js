require('dotenv').config();

/**
 * Read an env var with an optional default.
 * When required and missing, logs a clear message and throws.
 */
function getEnv(key, { required = false, defaultValue } = {}) {
  const value = process.env[key] ?? defaultValue;

  if (required && (value === undefined || value === null || value === '')) {
    const message =
      `Missing required environment variable: ${key}. ` +
      'Set it in Vercel Project Settings → Environment Variables (or your local .env).';
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
      'Set them in Vercel Project Settings → Environment Variables.';
    console.error(`[env] ${message}`);
    throw new Error(message);
  }
}

const FRONTEND_URL = getEnv('FRONTEND_URL', {
  defaultValue: 'http://localhost:3000',
});

module.exports = {
  PORT: getEnv('PORT', { defaultValue: '5000' }),
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', { defaultValue: '7d' }),
  NODE_ENV: getEnv('NODE_ENV', { defaultValue: 'development' }),
  LOG_LEVEL: getEnv('LOG_LEVEL', { defaultValue: 'info' }),
  FRONTEND_URL,
  CLIENT_URL: getEnv('CLIENT_URL', { defaultValue: FRONTEND_URL }),
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_SECURE: process.env.EMAIL_SECURE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
  assertRequiredEnv,
  getEnv,
};
