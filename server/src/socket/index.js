/**
 * Socket.io Server Initialization
 * Sets up Socket.io with authentication and event handlers
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  handleSetup,
  handleDisconnect,
  handleJoinChat,
  handleLeaveChat,
  handleNewMessage,
  handleTyping,
  handleStopTyping,
  handleMessageRead,
  handleGetOnlineStatus
} from './handlers.js';
import { clearOnlineUsers } from './utils.js';

/**
 * Initialize Socket.io server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.io server instance
 */
export const initializeSocket = (server) => {
  // Clear any stale online users from previous server instance
  clearOnlineUsers();

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const user = socket.user;

    // Setup user connection
    handleSetup(io, socket, user);

    // Join a chat room
    socket.on('join_chat', (data) => {
      // Support both { chatId } object and plain string
      const chatId = typeof data === 'string' ? data : data?.chatId;
      handleJoinChat(socket, chatId, user);
    });

    // Leave a chat room
    socket.on('leave_chat', (data) => {
      // Support both { chatId } object and plain string
      const chatId = typeof data === 'string' ? data : data?.chatId;
      handleLeaveChat(socket, chatId, user);
    });

    // Send a new message
    socket.on('new_message', (messageData) => {
      handleNewMessage(io, socket, messageData, user);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      handleTyping(socket, data, user);
    });

    // Stop typing indicator
    socket.on('stop_typing', (data) => {
      handleStopTyping(socket, data, user);
    });

    // Mark messages as read
    socket.on('message_read', (data) => {
      handleMessageRead(io, socket, data, user);
    });

    // Get online status of specific users
    socket.on('get_online_status', (data) => {
      handleGetOnlineStatus(socket, data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      handleDisconnect(io, socket);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${user.name}:`, error);
    });
  });

  console.log('🔌 Socket.io initialized');

  return io;
};

export default initializeSocket;
