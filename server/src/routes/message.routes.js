/**
 * Message Routes
 * Routes for message sending and retrieval
 */

import { Router } from 'express';
import {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getUnreadCount,
  getAllUnreadCounts
} from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validation.js';

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/messages/unread/all
 * @desc    Get unread counts for all user's chats
 * @access  Private
 */
router.get('/unread/all', getAllUnreadCounts);

/**
 * @route   POST /api/messages
 * @desc    Send a message to a chat
 * @access  Private
 * @body    { chatId, content, type?, attachments? }
 */
router.post('/', sendMessage);

/**
 * @route   GET /api/messages/:chatId
 * @desc    Get messages for a chat
 * @access  Private
 * @query   page - Page number (default: 1)
 * @query   limit - Messages per page (default: 50)
 */
router.get('/:chatId', validateObjectId('chatId'), getMessages);

/**
 * @route   PUT /api/messages/:chatId/read
 * @desc    Mark all messages in a chat as read
 * @access  Private
 */
router.put('/:chatId/read', validateObjectId('chatId'), markMessagesAsRead);

/**
 * @route   GET /api/messages/:chatId/unread
 * @desc    Get unread message count for a chat
 * @access  Private
 */
router.get('/:chatId/unread', validateObjectId('chatId'), getUnreadCount);

export default router;
