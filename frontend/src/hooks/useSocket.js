import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../utils/constants';

const SOCKET_IO_ENABLED = process.env.VITE_ENABLE_SOCKET_IO === 'true';

const useSocket = (userId, { onCreated, onUpdated, onDeleted } = {}) => {
  const socketRef = useRef(null);
  const handlersRef = useRef({ onCreated, onUpdated, onDeleted });

  useEffect(() => {
    handlersRef.current = { onCreated, onUpdated, onDeleted };
  }, [onCreated, onUpdated, onDeleted]);

  useEffect(() => {
    if (!userId || !SOCKET_IO_ENABLED) return;

    const socketUrl = new URL(API_BASE_URL).origin;

    const socket = io(socketUrl, {
      auth: (callback) => callback({ token: globalThis.__REDUX_STORE__?.getState()?.auth?.token || localStorage.getItem('token') }),
      transports: ['websocket'],
      withCredentials: true,
    });

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

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] connection failed:', err?.message || err);
    });

    socket.on('note:created', handleCreated);
    socket.on('note:updated', handleUpdated);
    socket.on('note:deleted', handleDeleted);

    return () => {
      socket.off('connect_error');
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
