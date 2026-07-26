const logger = require('../config/logger');

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// pino-http can be fragile on some serverless runtimes — use a tiny logger there
if (isServerless) {
  module.exports = function simpleRequestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
      console.log(
        `[http] ${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${Date.now() - start}ms`
      );
    });
    next();
  };
} else {
  const pinoHttp = require('pino-http');

  module.exports = pinoHttp({
    logger,
    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} completed — ${res.statusCode}`,
    customErrorMessage: (req, res, err) =>
      `${req.method} ${req.url} failed — ${res.statusCode} — ${err.message}`,
    customAttributeKeys: {
      req: 'request',
      res: 'response',
      err: 'error',
      responseTime: 'timeTaken',
    },
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
          userAgent: req.headers['user-agent'],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  });
}
