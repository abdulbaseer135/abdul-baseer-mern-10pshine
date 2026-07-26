const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = require('../config/env');
const logger = require('../config/logger');

/**
 * Create a fresh transporter per send on serverless.
 * Persistent pooled SMTP connections often hang or go stale on Vercel.
 */
const createTransporter = () =>
  nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: EMAIL_SECURE === 'true',
    auth: {
      user: EMAIL_USER,
      // Gmail app passwords may be stored with spaces
      pass: EMAIL_PASS ? String(EMAIL_PASS).replaceAll(/\s+/g, '') : EMAIL_PASS,
    },
    pool: false,
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000,
    tls: {
      // Avoid rare TLS stalls on some serverless runtimes
      minVersion: 'TLSv1.2',
    },
  });

/**
 * Send OTP email
 * @param {string} email
 * @param {string} otp
 * @param {string} purpose - 'verify' | 'reset'
 */
const sendOTPEmail = async (email, otp, purpose) => {
  const transporter = createTransporter();

  try {
    const subject =
      purpose === 'verify'
        ? 'Verify Your Email - 6 Digit Code'
        : 'Reset Password - 6 Digit Code';

    const title = purpose === 'verify' ? 'Email Verification' : 'Password Reset';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .content { background: #f5f5f5; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .otp-box { background: white; border: 2px solid #667eea; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            .warning { color: #ff6b6b; font-size: 14px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title}</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your one-time password (OTP) for ${purpose === 'verify' ? 'email verification' : 'password reset'} is:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p class="warning">Do not share this code with anyone. Our support team will never ask for your OTP.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Notes App. All rights reserved.</p>
              <p>If you did not request this code, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: EMAIL_FROM || EMAIL_USER,
      to: email,
      subject,
      html: htmlContent,
    });

    logger.info({ email, purpose }, 'OTP email sent successfully');
  } catch (error) {
    logger.error({ email, error: error.message }, 'Failed to send OTP email');
    throw new Error('Failed to send OTP email');
  } finally {
    try {
      transporter.close();
    } catch {
      // ignore close errors
    }
  }
};

/**
 * Best-effort email send that never blocks the API longer than maxWaitMs.
 * OTP is already stored in DB before this is called, so the client can resend.
 */
const sendOTPEmailNonBlocking = async (email, otp, purpose, maxWaitMs = 4000) => {
  const sendPromise = sendOTPEmail(email, otp, purpose).catch((err) => {
    console.error('[email] OTP send failed:', err.message);
    return null;
  });

  await Promise.race([
    sendPromise,
    new Promise((resolve) => setTimeout(resolve, maxWaitMs)),
  ]);

  // Keep the promise alive a bit longer on Vercel Fluid compute when possible
  try {
    // Optional — present on newer Vercel runtimes
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const vercelFns = require('@vercel/functions');
    if (typeof vercelFns.waitUntil === 'function') {
      vercelFns.waitUntil(sendPromise);
    }
  } catch {
    // Package not installed — floating promise is best-effort
  }
};

module.exports = { sendOTPEmail, sendOTPEmailNonBlocking };
