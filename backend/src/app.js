const express = require('express');
const requestLogger = require('./middleware/requestLogger.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const routes = require('./routes/index');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(requestLogger);

// API routes
app.use('/api/v1', routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;