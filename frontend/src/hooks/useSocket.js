import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (userId, { onCreated, onUpdated, onDeleted } = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // ✅ Connect to backend Socket.IO server
    socketRef.current = io(process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    // ✅ Join private room using userId
    socketRef.current.emit('join', userId);

    // ✅ Listen for real-time note events
    socketRef.current.on('note:created', (note) => {
      // console.log('🔌 note:created', note);
      onCreated?.(note);
    });

    socketRef.current.on('note:updated', (note) => {
      // console.log('🔌 note:updated', note);
      onUpdated?.(note);
    });

    socketRef.current.on('note:deleted', ({ id }) => {
      // console.log('🔌 note:deleted', id);
      onDeleted?.(id);
    });

    // ✅ Cleanup on unmount or userId change
    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]); // eslint-disable-line

  return socketRef.current;
};

export default useSocket;