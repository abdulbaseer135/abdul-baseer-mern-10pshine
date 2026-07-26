const express = require('express');
const cors = require('cors');
const path = require('node:path');
const requestLogger = require('./middleware/requestLogger.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const routes = require('./routes/index');
const connectDB = require('./config/db');
const { FRONTEND_URL } = require('./config/env');

const app = express();
app.disable('x-powered-by');
app.disable('etag');

// ─── CORS (FRONTEND_URL may be comma-separated) ───────────────────────────
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

const allowedOrigins = [
  FRONTEND_URL,
  process.env.CLIENT_URL,
  ...defaultOrigins,
]
  .filter(Boolean)
  .flatMap((value) => String(value).split(','))
  .map((value) => value.trim())
  .filter(Boolean);

const isVercelOrigin = (value) =>
  /^https:\/\/([a-z0-9-]+\.)*[a-z0-9-]+\.vercel\.app$/i.test(value);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (curl, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    const incoming = String(origin).trim();

    if (allowedOrigins.includes(incoming) || isVercelOrigin(incoming)) {
      // Echo the request origin when credentials: true
      return callback(null, incoming);
    }

    const error = new Error(`CORS not allowed for origin: ${incoming}`);
    error.status = 403;
    console.error('[CORS] Rejected origin:', incoming);
    return callback(error);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

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
} else {
  app.use(cors(corsOptions));
}

// cors() already handles OPTIONS preflight when used as middleware above

// ─── Body parsers & logging ───────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ─── Root: this is the API service — send browsers to the frontend ────────
app.get('/', (req, res) => {
  const frontend = String(FRONTEND_URL || '')
    .split(',')
    .map((v) => v.trim())
    .find(Boolean);

  const accept = String(req.headers.accept || '');
  if (frontend && accept.includes('text/html')) {
    return res.redirect(302, frontend);
  }

  res.status(200).json({
    success: true,
    message: 'Notes API is running',
    health: '/health',
    apiBase: '/api/v1',
    frontend: frontend || null,
  });
});

// ─── Health checks (no DB required — useful for Vercel smoke tests) ───────
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend is healthy',
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// ─── Ensure MongoDB is connected for API routes (serverless-safe cache) ───
app.use('/api/v1', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB] Failed before request:', err.message);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: err.message || 'Database connection failed',
    });
  }
});

// ─── Static uploads & API routes ──────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/v1', routes);

// ─── 404 ──────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
    method: req.method,
  });
});

// ─── Global error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

module.exports = app;
