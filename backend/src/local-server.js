/**
 * Local development entry ONLY.
 * Named so Vercel Express auto-detection does NOT pick this file
 * (it would call listen()/Socket.IO and crash the serverless function).
 *
 * Start locally with: npm start  →  node src/local-server.js
 */
const http = require('node:http');
const app = require('./app');
const connectDB = require('./config/db');
const { PORT, assertRequiredEnv } = require('./config/env');
const logger = require('./config/logger');
const { initSocket } = require('./config/socket');

const startServer = async () => {
  try {
    assertRequiredEnv();
    await connectDB();

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`🔌 Socket.IO initialized`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
