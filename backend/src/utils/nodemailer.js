const nodemailer = require('nodemailer');
const {
  EMAIL_PROVIDER,
  RESEND_API_KEY,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
} = require('../config/env');
const logger = require('../config/logger');

/**
 * Build HTML content for OTP verification or password reset emails.
 */
const buildOTPHtml = (otp, purpose) => {
  const title = purpose === 'verify' ? 'Email Verification' : 'Password Reset';
  const actionText = purpose === 'verify' ? 'email verification' : 'password reset';

  return `
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
            <p>Your one-time password (OTP) for ${actionText} is:</p>
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
};

/**
 * Deliver OTP email via Resend HTTPS REST API.
 */
const sendViaResend = async (email, otp, purpose) => {
  const apiKey = RESEND_API_KEY || process.env.RESEND_API_KEY;
  const from = EMAIL_FROM || process.env.EMAIL_FROM;

  if (!apiKey) {
    const err = new Error('RESEND_API_KEY is missing');
    err.code = 'CONFIG_ERROR';
    throw err;
  }
  if (!from) {
    const err = new Error('EMAIL_FROM is missing');
    err.code = 'CONFIG_ERROR';
    throw err;
  }

  const subject =
    purpose === 'verify'
      ? 'Verify Your Email - 6 Digit Code'
      : 'Reset Password - 6 Digit Code';
  const text = `Your verification code is ${otp}. It expires in 10 minutes. Do not share this code.`;
  const html = buildOTPHtml(otp, purpose);

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (netErr) {
    logger.error(
      {
        provider: 'resend',
        operation: 'sendOTPEmail',
        code: netErr.code || (netErr.name === 'TimeoutError' ? 'ETIMEDOUT' : 'NETWORK_ERROR'),
        message: netErr.message,
      },
      'Resend request connection failed or timed out'
    );
    const error = new Error('Failed to send OTP email');
    error.code = netErr.code || (netErr.name === 'TimeoutError' ? 'ETIMEDOUT' : 'NETWORK_ERROR');
    throw error;
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // If not json, body remains null
  }

  if (!response.ok) {
    const resendError = body?.error || body || {};
    logger.error(
      {
        provider: 'resend',
        operation: 'sendOTPEmail',
        statusCode: response.status,
        resendCode: resendError.name || resendError.statusCode,
        message: resendError.message || response.statusText,
      },
      'Resend rejected email delivery'
    );
    const error = new Error('Failed to send OTP email');
    error.statusCode = response.status;
    error.code = resendError.name || 'PROVIDER_ERROR';
    throw error;
  }

  logger.info(
    {
      provider: 'resend',
      operation: 'sendOTPEmail',
      id: body?.id,
      purpose,
    },
    'OTP email sent successfully via Resend'
  );
};

/**
 * Create a fresh transporter per send on serverless / local.
 */
const createTransporter = () =>
  nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: EMAIL_SECURE === 'true',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS ? String(EMAIL_PASS).replaceAll(/\s+/g, '') : EMAIL_PASS,
    },
    pool: false,
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000,
    tls: {
      minVersion: 'TLSv1.2',
    },
  });

/**
 * Deliver OTP email via SMTP.
 */
const sendViaSmtp = async (email, otp, purpose) => {
  const transporter = createTransporter();
  try {
    const subject =
      purpose === 'verify'
        ? 'Verify Your Email - 6 Digit Code'
        : 'Reset Password - 6 Digit Code';
    const htmlContent = buildOTPHtml(otp, purpose);

    await transporter.sendMail({
      from: EMAIL_FROM || EMAIL_USER,
      to: email,
      subject,
      html: htmlContent,
    });

    logger.info({ provider: 'smtp', operation: 'sendOTPEmail', purpose }, 'OTP email sent successfully via SMTP');
  } catch (error) {
    logger.error(
      {
        provider: 'smtp',
        operation: 'sendOTPEmail',
        code: error.code,
        message: error.message,
      },
      'Failed to send OTP email via SMTP'
    );
    throw error;
  } finally {
    try {
      transporter.close();
    } catch {
      // ignore close errors
    }
  }
};

/**
 * Send OTP email using configured provider (resend or smtp).
 * @param {string} email
 * @param {string} otp
 * @param {string} purpose - 'verify' | 'reset'
 */
const sendOTPEmail = async (email, otp, purpose) => {
  const provider = (EMAIL_PROVIDER || process.env.EMAIL_PROVIDER || (process.env.RESEND_API_KEY ? 'resend' : 'smtp')).toLowerCase();

  if (provider === 'resend') {
    return sendViaResend(email, otp, purpose);
  }

  if (process.env.NODE_ENV === 'production' && !EMAIL_PROVIDER && !process.env.RESEND_API_KEY) {
    logger.error({ provider: 'smtp' }, 'Attempting SMTP in production without RESEND_API_KEY or explicit provider configuration');
  }

  return sendViaSmtp(email, otp, purpose);
};

/**
 * Best-effort email send that never blocks the API longer than maxWaitMs.
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

  try {
    const vercelFns = require('@vercel/functions');
    if (typeof vercelFns.waitUntil === 'function') {
      vercelFns.waitUntil(sendPromise);
    }
  } catch {
    // Package not installed or not in serverless runtime
  }
};

module.exports = { sendOTPEmail, sendOTPEmailNonBlocking };
