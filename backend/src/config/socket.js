// backend/src/config/socket.js
const { Server } = require('socket.io');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(userId);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

/**
 * Safe for serverless: Socket.IO is not available on Vercel functions.
 * Returns a no-op emitter so route handlers do not throw.
 */
const getIO = () => {
  if (io) return io;

  const noop = {
    to() {
      return noop;
    },
    emit() {
      return false;
    },
  };
  return noop;
};

module.exports = { initSocket, getIO };
