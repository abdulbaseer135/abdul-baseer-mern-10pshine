const crypto = require('node:crypto'); // Sonar: prefer node:crypto import

/**
 * Generate a 6-digit OTP code
 * @returns {string} - 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP using SHA-256
 * @param {string} otp - OTP to hash
 * @returns {string} - Hashed OTP
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify OTP by comparing hashes
 * @param {string} storedHash - Hash stored in database
 * @param {string} inputOTP - OTP input by user
 * @returns {boolean}
 */
const verifyOTP = (storedHash, inputOTP) => {
  const inputHash = hashOTP(inputOTP);
  return storedHash === inputHash;
};

/**
 * Get OTP expiry time (10 minutes from now)
 * @returns {Date}
 */
const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

module.exports = { generateOTP, hashOTP, verifyOTP, getOTPExpiry };
