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
const defaultOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  ...defaultOrigins,
]
  .filter(Boolean)
  .flatMap((value) => String(value).split(','))
  .map((value) => value.trim())
  .filter(Boolean);

console.log('[CORS] Allowed origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow curl/postman/tools with no Origin header
    if (!origin) {
      return callback(null, true);
    }

    // Normalize incoming origin for comparison
    const incoming = String(origin).trim();

    // Debug log to help diagnose production preflight failures
    // (will appear in Render logs)
    console.debug('[CORS] Incoming Origin:', incoming);

    // Allow explicit allowed origins or any Vercel preview/deployment domain
    const isVercelOrigin = (value) => {
      // Match patterns like: https://project-name.vercel.app or
      // https://project-name-branch-username.vercel.app
      return /^https:\/\/([a-z0-9-]+\.)*[a-z0-9-]+\.vercel\.app$/i.test(value);
    };

    if (allowedOrigins.includes(incoming) || isVercelOrigin(incoming)) {
      // Explicitly return the allowed origin so Access-Control-Allow-Origin
      // equals the request origin (required when credentials: true).
      return callback(null, incoming);
    }

    const error = new Error(`CORS not allowed for origin: ${incoming}`);
    error.status = 403;
    console.error('[CORS] Rejected request from unauthorized origin:', incoming);
    return callback(error);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

// Support a temporary permissive mode for quick testing. Enable by
// setting CORS_ALLOW_ALL=true in environment (DO NOT leave enabled
// in production long-term).
if (process.env.CORS_ALLOW_ALL === 'true') {
  console.warn('[CORS] WARNING: permissive CORS enabled via CORS_ALLOW_ALL=true');
  app.use(
    cors({
      origin: (origin, cb) => cb(null, origin || true),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      optionsSuccessStatus: 200,
    })
  );
  app.options(/(.*)/, cors());
} else {
  app.use(cors(corsOptions));
  app.options(/(.*)/, cors(corsOptions));
}

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