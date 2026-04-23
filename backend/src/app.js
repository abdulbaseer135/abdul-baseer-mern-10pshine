const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/requestLogger.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const routes = require('./routes/index');

const app = express();

// ✅ CORS — must be before all routes
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

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