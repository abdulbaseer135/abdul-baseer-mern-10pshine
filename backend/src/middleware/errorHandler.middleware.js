const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction && statusCode >= 500 ? 'Internal Server Error' : err.message;

  console.error('[Error]', {
    message,
    statusCode,
    method: req.method,
    url: isProduction ? undefined : req.originalUrl || req.url,
  });

  if (logger?.error) {
    logger.error(
      {
        err: {
          message,
          stack: isProduction ? undefined : err.stack,
        },
        request: {
          method: req.method,
          url: isProduction ? undefined : req.url,
        },
        statusCode,
      },
      `Error: ${message}`
    );
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: process.env.NODE_ENV === 'production' && statusCode >= 500
      ? 'Internal Server Error' : err.message || 'Internal Server Error',
    errors: process.env.NODE_ENV === 'production' && statusCode >= 500 ? [] : err.errors || [],
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
