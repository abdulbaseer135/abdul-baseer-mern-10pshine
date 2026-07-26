/**
 * Local development entry only.
 * On Vercel, use api/index.js (exports the Express app — no listen).
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

startServer();