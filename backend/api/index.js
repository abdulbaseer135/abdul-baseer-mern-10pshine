/**
 * Vercel serverless entry.
 * Do NOT call app.listen() here — Vercel invokes this handler per request.
 *
 * package.json "main" should point here (or vercel.json builds.src).
 * Set env vars in Vercel: MONGO_URI, JWT_SECRET, FRONTEND_URL
 */
const app = require('../src/app');

// Export Express app — Vercel @vercel/node accepts the app directly.
// Equivalent pattern: module.exports = (req, res) => app(req, res);
module.exports = app;
