const pinoHttp = require('pino-http');
const logger = require('../config/logger');

const requestLogger = pinoHttp({
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

module.exports = requestLogger;