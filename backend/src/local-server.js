/**
 * Persistent Node server entry for local development and Render.
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
const mongoose = require('mongoose');

const startServer = async () => {
  try {
    assertRequiredEnv();
    await connectDB();

    const httpServer = http.createServer(app);
    const io = initSocket(httpServer);

    let stopping = false;
    const shutdown = () => {
      if (stopping) return;
      stopping = true;
      const timeout = setTimeout(() => process.exit(1), 10000);
      timeout.unref();
      io.close();
      httpServer.close(async () => {
        try {
          await mongoose.disconnect();
          clearTimeout(timeout);
          process.exit(0);
        } catch {
          process.exit(1);
        }
      });
    };
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);

    httpServer.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
      logger.info(`🔌 Socket.IO initialized`);
    });
    httpServer.on('error', () => {
      logger.error('HTTP server failed to listen');
      process.exit(1);
    });
    return httpServer;
  } catch (err) {
    console.error('[Server] Failed to start:', process.env.NODE_ENV === 'production' ? 'Check environment configuration and database connectivity' : err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
