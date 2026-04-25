// backend/src/config/socket.js
const { Server } = require('socket.io');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // console.log(`🔌 Client connected: ${socket.id}`);

    // ✅ User joins their own private room (only sees their own note events)
    socket.on('join', (userId) => {
      socket.join(userId);
      // console.log(`👤 User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
      // console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// ✅ Export getter so any file can access io without circular imports
const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = { initSocket, getIO };