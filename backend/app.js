/**
 * Primary Express entry for Vercel zero-config (`framework: express`).
 * Must export the app and must NOT call listen().
 *
 * If the full app fails to load, export a tiny diagnostic app so the
 * function does not die with FUNCTION_INVOCATION_FAILED (opaque 500).
 */
try {
  module.exports = require('./src/app');
} catch (err) {
  console.error('[backend/app.js] Failed to load src/app:', err?.stack || err);

  const express = require('express');
  const fallback = express();

  fallback.get(['/health', '/api/health'], (_req, res) => {
    res.status(200).json({
      status: 'DEGRADED',
      message: 'Express app failed to initialize',
      error: err?.message || String(err),
      timestamp: new Date().toISOString(),
    });
  });

  fallback.use((_req, res) => {
    res.status(500).json({
      success: false,
      error: 'APP_INIT_FAILED',
      message: err?.message || String(err),
    });
  });

  module.exports = fallback;
}
