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
    

    // ✅ User joins their own private room (only sees their own note events)
    socket.on('join', (userId) => {
      socket.join(userId);
      
    });

    socket.on('disconnect', () => {
      
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