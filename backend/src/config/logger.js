const pino = require('pino');

const isProd = process.env.NODE_ENV === 'production';

let logger;

try {
  logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    // Avoid pino-pretty worker threads on Vercel (can crash cold starts)
    transport: isProd
      ? undefined
      : { target: 'pino-pretty', options: { colorize: true } },
  });
} catch (err) {
  console.error('[logger] Falling back to basic pino:', err.message);
  logger = pino({ level: process.env.LOG_LEVEL || 'info' });
}

module.exports = logger;
