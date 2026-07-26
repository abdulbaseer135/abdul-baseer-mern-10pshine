/**
 * Vercel serverless entry (used by backend/vercel.json builds).
 *
 * - Never call app.listen()
 * - Health responds even if the full app fails to load (returns the real error)
 * - Lazy-require so import-time crashes become JSON 500s instead of FUNCTION_INVOCATION_FAILED
 */
function sendJson(res, statusCode, body) {
  if (res.headersSent) return;
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function isHealthPath(url = '') {
  const path = String(url).split('?')[0];
  return path === '/health' || path === '/api/health';
}

let cachedApp = null;
let loadError = null;

function getApp() {
  if (cachedApp) return cachedApp;
  if (loadError) throw loadError;

  try {
    cachedApp = require('../src/app');
    return cachedApp;
  } catch (err) {
    loadError = err;
    console.error('[vercel] Failed to load Express app:', err?.stack || err);
    throw err;
  }
}

module.exports = function vercelHandler(req, res) {
  try {
    if (isHealthPath(req.url)) {
      // Always answer health without needing DB / full route stack success path
      try {
        getApp();
        return getApp()(req, res);
      } catch (err) {
        return sendJson(res, 200, {
          status: 'DEGRADED',
          message: 'Function process is up, but Express app failed to initialize',
          error: err?.message || String(err),
          timestamp: new Date().toISOString(),
        });
      }
    }

    const app = getApp();
    return app(req, res);
  } catch (err) {
    console.error('[vercel] Handler crash:', err?.stack || err);
    return sendJson(res, 500, {
      success: false,
      error: 'FUNCTION_ERROR',
      message: err?.message || 'Serverless function failed to handle the request',
    });
  }
};
