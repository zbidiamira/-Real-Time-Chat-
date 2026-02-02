/**
 * Socket Context
 * Manages Socket.io connection and real-time events
 */

import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

// Create socket context
export const SocketContext = createContext(null);

// Socket server URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Socket Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const socketRef = useRef(null);

  /**
   * Initialize socket connection
   */
  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection with auth token
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      
      // Setup user session
      if (user?._id) {
        newSocket.emit('setup', { userId: user._id });
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Online status events
    newSocket.on('user_online', ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    newSocket.on('user_offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    newSocket.on('online_users', ({ users }) => {
      setOnlineUsers(new Set(users));
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, user?._id]);

  /**
   * Join a chat room
   * @param {string} chatId - Chat ID to join
   */
  const joinChat = useCallback((chatId) => {
    if (socket && chatId) {
      socket.emit('join_chat', { chatId });
    }
  }, [socket]);

  /**
   * Leave a chat room
   * @param {string} chatId - Chat ID to leave
   */
  const leaveChat = useCallback((chatId) => {
    if (socket && chatId) {
      socket.emit('leave_chat', { chatId });
    }
  }, [socket]);

  /**
   * Send a message via socket
   * @param {Object} message - Message object
   */
  const sendMessage = useCallback((message) => {
    if (socket) {
      socket.emit('new_message', message);
    }
  }, [socket]);

  /**
   * Emit typing indicator
   * @param {string} chatId - Chat ID
   */
  const emitTyping = useCallback((chatId) => {
    if (socket && user?._id) {
      socket.emit('typing', { chatId, userId: user._id, userName: user.name });
    }
  }, [socket, user]);

  /**
   * Emit stop typing
   * @param {string} chatId - Chat ID
   */
  const emitStopTyping = useCallback((chatId) => {
    if (socket && user?._id) {
      socket.emit('stop_typing', { chatId, userId: user._id });
    }
  }, [socket, user]);

  /**
   * Check if a user is online
   * @param {string} userId - User ID
   * @returns {boolean} Is online
   */
  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  const on = useCallback((event, handler) => {
    if (socket) {
      socket.on(event, handler);
    }
  }, [socket]);

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  const off = useCallback((event, handler) => {
    if (socket) {
      socket.off(event, handler);
    }
  }, [socket]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinChat,
    leaveChat,
    sendMessage,
    emitTyping,
    emitStopTyping,
    isUserOnline,
    on,
    off
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
