const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  // If an ApiError was explicitly created (e.g. 502 with user-safe message), preserve its message
  const isExplicitApiError = err.isOperational || err.statusCode !== undefined;
  const message = (isProduction && statusCode >= 500 && !isExplicitApiError)
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  console.error('[Error]', {
    message,
    statusCode,
    method: req.method,
    url: req.originalUrl || req.url,
  });

  if (logger?.error) {
    logger.error(
      {
        err: {
          message: err.message,
          stack: isProduction ? undefined : err.stack,
        },
        request: {
          method: req.method,
          url: req.originalUrl || req.url,
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
    message,
    errors: process.env.NODE_ENV === 'production' && statusCode >= 500 && !isExplicitApiError ? [] : err.errors || [],
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
