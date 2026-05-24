const dns = require('node:dns').promises; // Sonar: prefer node:dns import
const logger = require('../config/logger');

/**
 * Validate email format using regex
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const validateEmailFormat = (email) => {
  // Sonar: remove duplicate ranges in character classes (/i makes matching case-insensitive)
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  return emailRegex.test(email);
};

/**
 * Validate email domain MX records
 * Confirms domain can receive mail
 * If DNS lookup fails (network issues), allow through for valid format
 * @param {string} email - Email to validate
 * @returns {Promise<boolean>}
 */
const validateEmailDomain = async (email) => {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;
    
    // Check if MX records exist
    const mxRecords = await dns.resolveMx(domain);
    return Array.isArray(mxRecords) && mxRecords.length > 0;
  } catch (error) {
    // Log DNS lookup error for debugging
    logger.warn({ email, error: error.message }, 'DNS MX lookup failed');
    
    // If DNS lookup fails, allow signup if email format is valid
    // This handles network/environment issues without blocking valid emails
    // Known valid domains (Gmail, Outlook, etc.) will pass
    const knownValidDomains = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
      'icloud.com', 'mail.com', 'protonmail.com', 'yandex.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (domain && knownValidDomains.includes(domain)) {
      logger.info({ email, domain }, 'DNS failed but domain is known valid');
      return true;
    }
    
    // For other domains, if DNS fails, return false to warn user
    // but allow retry if they have valid DNS setup
    logger.warn({ email }, 'DNS validation inconclusive for unknown domain');
    return false;
  }
};

module.exports = { validateEmailFormat, validateEmailDomain };
