const dns = require('node:dns').promises;
const logger = require('../config/logger');

const MX_LOOKUP_TIMEOUT_MS = 2500;

/**
 * Validate email format using regex
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const validateEmailFormat = (email) => {
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  return emailRegex.test(email);
};

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);

/**
 * Validate email domain MX records (capped — DNS can hang on serverless).
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const validateEmailDomain = async (email) => {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;

    const mxRecords = await withTimeout(
      dns.resolveMx(domain),
      MX_LOOKUP_TIMEOUT_MS,
      'DNS MX lookup'
    );

    return Array.isArray(mxRecords) && mxRecords.length > 0;
  } catch (error) {
    logger.warn({ email, error: error.message }, 'DNS MX lookup failed or timed out');

    const knownValidDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'icloud.com',
      'mail.com',
      'protonmail.com',
      'yandex.com',
    ];
    const domain = email.split('@')[1]?.toLowerCase();

    if (domain && knownValidDomains.includes(domain)) {
      logger.info({ email, domain }, 'DNS failed but domain is known valid');
      return true;
    }

    // On timeout/network issues, allow signup if format is valid so Vercel
    // cold starts / flaky DNS do not block registration.
    if (/timed out/i.test(error.message)) {
      logger.warn({ email }, 'Allowing signup after MX timeout (format already valid)');
      return true;
    }

    logger.warn({ email }, 'DNS validation inconclusive for unknown domain');
    return false;
  }
};

module.exports = { validateEmailFormat, validateEmailDomain };
