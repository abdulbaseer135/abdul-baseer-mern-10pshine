const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  console.error('[Error]', {
    message: err.message,
    statusCode,
    method: req.method,
    url: req.originalUrl || req.url,
  });

  if (logger?.error) {
    logger.error(
      {
        err: {
          message: err.message,
          stack: err.stack,
        },
        request: {
          method: req.method,
          url: req.url,
        },
        statusCode,
      },
      `Error: ${err.message}`
    );
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
