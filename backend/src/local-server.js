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
const { startupDiagnostic } = require('./utils/startupDiagnostics');

const startServer = async () => {
  let phase = 'environment_validation';
  const enterPhase = (nextPhase) => {
    phase = nextPhase;
    logger.info({ event: 'startup_phase', phase }, 'Server startup');
  };
  const fail = (error) => {
    console.error(JSON.stringify(startupDiagnostic(phase, error)));
    process.exit(1);
  };
  try {
    enterPhase('environment_validation');
    assertRequiredEnv();
    enterPhase('database_connection');
    await connectDB();

    enterPhase('http_server_creation');
    const httpServer = http.createServer(app);
    enterPhase('socket_initialization');
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

    enterPhase('http_listen');
    httpServer.on('error', fail);
    httpServer.listen(PORT, () => {
      logger.info({ event: 'startup_ready' }, 'Server startup complete');
      logger.info(`Server listening on port ${PORT}`);
      logger.info(`🔌 Socket.IO initialized`);
    });
    return httpServer;
  } catch (err) {
    fail(err);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
