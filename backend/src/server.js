const http = require('node:http'); // Sonar: prefer node:http over http
const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');
const logger = require('./config/logger');
const { initSocket } = require('./config/socket');

const startServer = async () => {
  await connectDB();

  // ✅ Create HTTP server from Express app
  const httpServer = http.createServer(app);

  // ✅ Initialize Socket.IO with the HTTP server
  initSocket(httpServer);

  // ✅ Listen on HTTP server — NOT app.listen()
  httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`🔌 Socket.IO initialized`);
  });
};

startServer();