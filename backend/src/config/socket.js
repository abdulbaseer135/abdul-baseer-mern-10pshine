// backend/src/config/socket.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, CLIENT_URL } = require('./env');
const { findById } = require('../dal/users.dal');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL.split(',').map((origin) => origin.trim()),
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const decoded = jwt.verify(socket.handshake.auth?.token, JWT_SECRET);
      const user = await findById(decoded.id);
      if (!user?.isEmailVerified || (decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
        return next(new Error('Not authorized'));
      }
      socket.data.userId = user._id.toString();
      next();
    } catch {
      next(new Error('Not authorized'));
    }
  });
  io.on('connection', (socket) => {
    socket.join(socket.data.userId);

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
    in() { return noop; },
    disconnectSockets() { return false; },
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
