const express = require('express');
const cors = require('cors');
const path = require('node:path'); // Sonar: prefer node:path over path
const requestLogger = require('./middleware/requestLogger.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const routes = require('./routes/index');

const app = express();
app.disable('x-powered-by');

app.disable('etag');

// ✅ CORS — must be before all routes
app.use(cors({
  origin: (origin, callback) => {
    const configuredOrigins = [
      process.env.FRONTEND_URL,
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ]
      .filter(Boolean)
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter(Boolean);

    const isVercelOrigin = (originValue) => {
      return /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(originValue);
    };

    const allowedOrigins = new Set(configuredOrigins);

    const isAllowed = !origin || allowedOrigins.has(origin) || isVercelOrigin(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      const error = new Error(`CORS not allowed for origin: ${origin}`);
      error.status = 403;
      console.error('[CORS] Rejected request from unauthorized origin:', origin);
      callback(error);
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(requestLogger);

// ✅ Serve uploads directory as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/v1', routes);

// Health check
app.get('/health', (req, res) => {
  try {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Sonar: handle caught exception
    console.error('[Health Check] Error sending health status:', err?.message);
    res.status(500).json({
      status: 'ERROR',
      error: 'Failed to generate health check response',
    });
  }
});

// 404 handler — catch undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;