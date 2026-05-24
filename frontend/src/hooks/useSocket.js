import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (userId, { onCreated, onUpdated, onDeleted } = {}) => {
  const socketRef = useRef(null);
  const handlersRef = useRef({ onCreated, onUpdated, onDeleted });

  useEffect(() => {
    handlersRef.current = { onCreated, onUpdated, onDeleted };
  }, [onCreated, onUpdated, onDeleted]);

  useEffect(() => {
    if (!userId) return;

    const socket = io(
      process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:5000',
      {
        transports: ['websocket'],
        withCredentials: true,
      }
    );

    socketRef.current = socket;

    const handleCreated = (note) => {
      handlersRef.current.onCreated?.(note);
    };

    const handleUpdated = (note) => {
      handlersRef.current.onUpdated?.(note);
    };

    const handleDeleted = ({ id }) => {
      handlersRef.current.onDeleted?.(id);
    };

    socket.emit('join', userId);
    socket.on('note:created', handleCreated);
    socket.on('note:updated', handleUpdated);
    socket.on('note:deleted', handleDeleted);

    return () => {
      socket.off('note:created', handleCreated);
      socket.off('note:updated', handleUpdated);
      socket.off('note:deleted', handleDeleted);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  return socketRef;
};

export default useSocket;