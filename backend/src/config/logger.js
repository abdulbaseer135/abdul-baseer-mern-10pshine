const pino = require('pino');

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const isProd = process.env.NODE_ENV === 'production' || isServerless;

let logger;

try {
  logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    // Never use pino-pretty workers on Vercel — they crash cold starts
    transport:
      isProd || isServerless
        ? undefined
        : { target: 'pino-pretty', options: { colorize: true } },
  });
} catch (err) {
  console.error('[logger] Falling back to basic pino:', err.message);
  logger = pino({ level: process.env.LOG_LEVEL || 'info' });
}

module.exports = logger;
