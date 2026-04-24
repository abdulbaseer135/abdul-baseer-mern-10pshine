const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
    },
    statusCode,
  }, `Error: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;