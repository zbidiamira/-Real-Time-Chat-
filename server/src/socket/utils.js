/**
 * Socket.io Utility Functions
 * Helper functions for socket management
 */

// Store online users: Map<userId, Set<socketId>>
const onlineUsers = new Map();

// Store socket to user mapping: Map<socketId, userId>
const socketToUser = new Map();

/**
 * Add a user's socket connection
 * @param {string} userId - User ID
 * @param {string} socketId - Socket ID
 */
export const addUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socketId);
  socketToUser.set(socketId, userId);
};

/**
 * Remove a user's socket connection
 * @param {string} socketId - Socket ID
 * @returns {string|null} User ID if this was their last connection
 */
export const removeUser = (socketId) => {
  const userId = socketToUser.get(socketId);
  if (!userId) return null;

  socketToUser.delete(socketId);
  
  const userSockets = onlineUsers.get(userId);
  if (userSockets) {
    userSockets.delete(socketId);
    if (userSockets.size === 0) {
      onlineUsers.delete(userId);
      return userId; // User is now offline
    }
  }
  return null; // User still has other connections
};

/**
 * Get user ID by socket ID
 * @param {string} socketId - Socket ID
 * @returns {string|null} User ID
 */
export const getUserBySocket = (socketId) => {
  return socketToUser.get(socketId) || null;
};

/**
 * Get all socket IDs for a user
 * @param {string} userId - User ID
 * @returns {string[]} Array of socket IDs
 */
export const getUserSockets = (userId) => {
  const sockets = onlineUsers.get(userId);
  return sockets ? Array.from(sockets) : [];
};

/**
 * Check if a user is online
 * @param {string} userId - User ID
 * @returns {boolean} True if user is online
 */
export const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

/**
 * Get all online user IDs
 * @returns {string[]} Array of online user IDs
 */
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

/**
 * Get online users from a list of user IDs
 * @param {string[]} userIds - Array of user IDs to check
 * @returns {string[]} Array of online user IDs from the list
 */
export const getOnlineUsersFromList = (userIds) => {
  return userIds.filter(userId => isUserOnline(userId));
};

/**
 * Get count of online users
 * @returns {number} Number of online users
 */
export const getOnlineCount = () => {
  return onlineUsers.size;
};

/**
 * Emit to a specific user (all their sockets)
 * @param {Object} io - Socket.io server instance
 * @param {string} userId - User ID to emit to
 * @param {string} event - Event name
 * @param {*} data - Data to send
 */
export const emitToUser = (io, userId, event, data) => {
  const sockets = getUserSockets(userId);
  sockets.forEach(socketId => {
    io.to(socketId).emit(event, data);
  });
};

/**
 * Emit to multiple users
 * @param {Object} io - Socket.io server instance
 * @param {string[]} userIds - Array of user IDs
 * @param {string} event - Event name
 * @param {*} data - Data to send
 */
export const emitToUsers = (io, userIds, event, data) => {
  userIds.forEach(userId => {
    emitToUser(io, userId, event, data);
  });
};

/**
 * Clear all online users (for server restart)
 */
export const clearOnlineUsers = () => {
  onlineUsers.clear();
  socketToUser.clear();
};

export default {
  addUser,
  removeUser,
  getUserBySocket,
  getUserSockets,
  isUserOnline,
  getOnlineUsers,
  getOnlineUsersFromList,
  getOnlineCount,
  emitToUser,
  emitToUsers,
  clearOnlineUsers
};
