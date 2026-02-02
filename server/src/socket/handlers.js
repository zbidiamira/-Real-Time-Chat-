/**
 * Socket.io Event Handlers
 * Handle all socket events for real-time communication
 */

import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import {
  addUser,
  removeUser,
  getUserBySocket,
  isUserOnline,
  getOnlineUsers,
  emitToUser,
  emitToUsers
} from './utils.js';

/**
 * Handle user setup/connection
 * @param {Object} io - Socket.io server instance
 * @param {Object} socket - Socket instance
 * @param {Object} user - Authenticated user
 */
export const handleSetup = async (io, socket, user) => {
  try {
    // Add user to online tracking
    addUser(user._id.toString(), socket.id);

    // Update user's online status in database
    await User.findByIdAndUpdate(user._id, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Join user's personal room for direct notifications
    socket.join(user._id.toString());

    // Get user's chats to notify others
    const userChats = await Chat.find({
      users: { $elemMatch: { $eq: user._id } }
    }).select('users');

    // Get unique user IDs from all chats
    const contactIds = new Set();
    userChats.forEach(chat => {
      chat.users.forEach(userId => {
        if (userId.toString() !== user._id.toString()) {
          contactIds.add(userId.toString());
        }
      });
    });

    // Notify contacts that user is online
    emitToUsers(io, Array.from(contactIds), 'user_online', {
      userId: user._id.toString(),
      isOnline: true
    });

    // Send current online users to the connected user
    socket.emit('online_users', getOnlineUsers());

    console.log(`👤 User connected: ${user.name} (${user._id})`);
  } catch (error) {
    console.error('Error in handleSetup:', error);
  }
};

/**
 * Handle user disconnection
 * @param {Object} io - Socket.io server instance
 * @param {Object} socket - Socket instance
 */
export const handleDisconnect = async (io, socket) => {
  try {
    const userId = getUserBySocket(socket.id);
    if (!userId) return;

    // Remove socket and check if user is fully offline
    const wentOffline = removeUser(socket.id);

    if (wentOffline) {
      // Update user's online status in database
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Get user's contacts
      const userChats = await Chat.find({
        users: { $elemMatch: { $eq: userId } }
      }).select('users');

      const contactIds = new Set();
      userChats.forEach(chat => {
        chat.users.forEach(uid => {
          if (uid.toString() !== userId) {
            contactIds.add(uid.toString());
          }
        });
      });

      // Notify contacts that user is offline
      emitToUsers(io, Array.from(contactIds), 'user_offline', {
        userId,
        isOnline: false,
        lastSeen: new Date()
      });

      const user = await User.findById(userId).select('name');
      console.log(`👋 User disconnected: ${user?.name || userId}`);
    }
  } catch (error) {
    console.error('Error in handleDisconnect:', error);
  }
};

/**
 * Handle joining a chat room
 * @param {Object} socket - Socket instance
 * @param {string} chatId - Chat ID to join
 * @param {Object} user - Authenticated user
 */
export const handleJoinChat = async (socket, chatId, user) => {
  try {
    // Verify user is a member of this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isMember(user._id)) {
      socket.emit('error', { message: 'Not authorized to join this chat' });
      return;
    }

    // Leave previous chat room (except personal room)
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room !== socket.id && room !== user._id.toString()) {
        socket.leave(room);
      }
    });

    // Join the chat room
    socket.join(chatId);
    socket.emit('joined_chat', { chatId });

    console.log(`📥 ${user.name} joined chat: ${chatId}`);
  } catch (error) {
    console.error('Error in handleJoinChat:', error);
    socket.emit('error', { message: 'Failed to join chat' });
  }
};

/**
 * Handle leaving a chat room
 * @param {Object} socket - Socket instance
 * @param {string} chatId - Chat ID to leave
 * @param {Object} user - Authenticated user
 */
export const handleLeaveChat = (socket, chatId, user) => {
  socket.leave(chatId);
  socket.emit('left_chat', { chatId });
  console.log(`📤 ${user.name} left chat: ${chatId}`);
};

/**
 * Handle new message broadcast
 * The message is already created via REST API, this just broadcasts it
 * @param {Object} io - Socket.io server instance
 * @param {Object} socket - Socket instance
 * @param {Object} message - Already created message object
 * @param {Object} user - Authenticated user
 */
export const handleNewMessage = async (io, socket, message, user) => {
  try {
    // Get chat ID from message (could be object or string)
    const chatId = message.chat?._id || message.chat;

    if (!chatId) {
      socket.emit('error', { message: 'Invalid message data' });
      return;
    }

    // Verify user is a member of this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isMember(user._id)) {
      socket.emit('error', { message: 'Not authorized to send messages to this chat' });
      return;
    }

    // Broadcast to all OTHER users in the chat room (sender already has it locally)
    socket.to(chatId).emit('message_received', message);

    // Also emit to chat members who might not be in the room
    const chatMembers = chat.users.map(u => u.toString());
    chatMembers.forEach(memberId => {
      if (memberId !== user._id.toString()) {
        emitToUser(io, memberId, 'new_message_notification', {
          chatId,
          message: {
            _id: message._id,
            content: message.content,
            sender: message.sender,
            createdAt: message.createdAt
          }
        });
      }
    });

    console.log(`💬 Message broadcast in chat ${chatId} from ${user.name}`);
  } catch (error) {
    console.error('Error in handleNewMessage:', error);
    socket.emit('error', { message: 'Failed to broadcast message' });
  }
};

/**
 * Handle typing indicator
 * @param {Object} socket - Socket instance
 * @param {Object} data - Typing data { chatId }
 * @param {Object} user - Authenticated user
 */
export const handleTyping = (socket, data, user) => {
  const { chatId } = data;
  if (!chatId) return;

  socket.to(chatId).emit('typing', {
    chatId,
    userId: user._id.toString(),
    userName: user.name
  });
};

/**
 * Handle stop typing indicator
 * @param {Object} socket - Socket instance
 * @param {Object} data - Typing data { chatId }
 * @param {Object} user - Authenticated user
 */
export const handleStopTyping = (socket, data, user) => {
  const { chatId } = data;
  if (!chatId) return;

  socket.to(chatId).emit('stop_typing', {
    chatId,
    userId: user._id.toString()
  });
};

/**
 * Handle message read acknowledgment
 * @param {Object} io - Socket.io server instance
 * @param {Object} socket - Socket instance
 * @param {Object} data - Read data { chatId }
 * @param {Object} user - Authenticated user
 */
export const handleMessageRead = async (io, socket, data, user) => {
  try {
    const { chatId } = data;
    if (!chatId) return;

    // Mark all messages as read
    await Message.updateMany(
      {
        chat: chatId,
        readBy: { $ne: user._id }
      },
      {
        $addToSet: { readBy: user._id }
      }
    );

    // Notify other users in the chat
    socket.to(chatId).emit('messages_read', {
      chatId,
      userId: user._id.toString()
    });
  } catch (error) {
    console.error('Error in handleMessageRead:', error);
  }
};

/**
 * Handle get online status request
 * @param {Object} socket - Socket instance
 * @param {Object} data - Data containing userIds array
 */
export const handleGetOnlineStatus = (socket, data) => {
  const { userIds } = data;
  if (!Array.isArray(userIds)) return;

  const onlineStatus = {};
  userIds.forEach(userId => {
    onlineStatus[userId] = isUserOnline(userId);
  });

  socket.emit('online_status', onlineStatus);
};

export default {
  handleSetup,
  handleDisconnect,
  handleJoinChat,
  handleLeaveChat,
  handleNewMessage,
  handleTyping,
  handleStopTyping,
  handleMessageRead,
  handleGetOnlineStatus
};
