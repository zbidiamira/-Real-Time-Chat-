/**
 * Message Controller
 * Handles message sending and retrieval
 */

import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../utils/responseHandler.js';
import AppError from '../utils/AppError.js';

/**
 * @desc    Send a message to a chat
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content, type = 'text', attachments } = req.body;

  if (!chatId) {
    throw AppError.badRequest('Chat ID is required');
  }

  if (!content || !content.trim()) {
    throw AppError.badRequest('Message content is required');
  }

  // Validate chatId format
  if (!chatId.match(/^[0-9a-fA-F]{24}$/)) {
    throw AppError.badRequest('Invalid chat ID format');
  }

  // Check if chat exists and user is a member
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw AppError.notFound('Chat not found');
  }

  if (!chat.isMember(req.user._id)) {
    throw AppError.forbidden('You are not a member of this chat');
  }

  // Create message
  const messageData = {
    sender: req.user._id,
    chat: chatId,
    content: content.trim(),
    type,
    readBy: [req.user._id] // Sender has read the message
  };

  // Add attachments if provided
  if (attachments && Array.isArray(attachments) && attachments.length > 0) {
    messageData.attachments = attachments;
  }

  let message = await Message.create(messageData);

  // Populate sender details
  message = await message.populate('sender', 'name email avatar');
  message = await message.populate('chat');

  // Update chat's latestMessage
  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message._id
  });

  sendSuccess(res, 201, 'Message sent successfully', { message });
});

/**
 * @desc    Get messages for a chat
 * @route   GET /api/messages/:chatId
 * @access  Private
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  // Validate chatId format
  if (!chatId.match(/^[0-9a-fA-F]{24}$/)) {
    throw AppError.badRequest('Invalid chat ID format');
  }

  // Check if chat exists and user is a member
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw AppError.notFound('Chat not found');
  }

  if (!chat.isMember(req.user._id)) {
    throw AppError.forbidden('You are not a member of this chat');
  }

  // Get total count for pagination
  const total = await Message.countDocuments({ chat: chatId });

  // Get messages with pagination (newest first for infinite scroll, then reverse for display)
  const messages = await Message.find({ chat: chatId })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Reverse to get chronological order for display
  messages.reverse();

  sendPaginated(res, {
    data: messages,
    page,
    limit,
    total,
    message: 'Messages retrieved successfully'
  });
});

/**
 * @desc    Mark messages as read
 * @route   PUT /api/messages/:chatId/read
 * @access  Private
 */
export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // Validate chatId format
  if (!chatId.match(/^[0-9a-fA-F]{24}$/)) {
    throw AppError.badRequest('Invalid chat ID format');
  }

  // Check if chat exists and user is a member
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw AppError.notFound('Chat not found');
  }

  if (!chat.isMember(req.user._id)) {
    throw AppError.forbidden('You are not a member of this chat');
  }

  // Mark all unread messages as read by this user
  const result = await Message.updateMany(
    {
      chat: chatId,
      readBy: { $ne: req.user._id }
    },
    {
      $addToSet: { readBy: req.user._id }
    }
  );

  sendSuccess(res, 200, 'Messages marked as read', {
    modifiedCount: result.modifiedCount
  });
});

/**
 * @desc    Get unread message count for a chat
 * @route   GET /api/messages/:chatId/unread
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // Validate chatId format
  if (!chatId.match(/^[0-9a-fA-F]{24}$/)) {
    throw AppError.badRequest('Invalid chat ID format');
  }

  // Check if chat exists and user is a member
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw AppError.notFound('Chat not found');
  }

  if (!chat.isMember(req.user._id)) {
    throw AppError.forbidden('You are not a member of this chat');
  }

  const count = await Message.getUnreadCount(chatId, req.user._id);

  sendSuccess(res, 200, 'Unread count retrieved', { unreadCount: count });
});

/**
 * @desc    Get all unread counts for user's chats
 * @route   GET /api/messages/unread/all
 * @access  Private
 */
export const getAllUnreadCounts = asyncHandler(async (req, res) => {
  // Get all chats for the user
  const chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } }
  }).select('_id');

  const chatIds = chats.map(chat => chat._id);

  // Aggregate unread counts for all chats
  const unreadCounts = await Message.aggregate([
    {
      $match: {
        chat: { $in: chatIds },
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      }
    },
    {
      $group: {
        _id: '$chat',
        count: { $sum: 1 }
      }
    }
  ]);

  // Convert to object for easy lookup
  const unreadMap = {};
  unreadCounts.forEach(item => {
    unreadMap[item._id.toString()] = item.count;
  });

  // Calculate total unread
  const totalUnread = unreadCounts.reduce((sum, item) => sum + item.count, 0);

  sendSuccess(res, 200, 'Unread counts retrieved', {
    unreadCounts: unreadMap,
    totalUnread
  });
});
