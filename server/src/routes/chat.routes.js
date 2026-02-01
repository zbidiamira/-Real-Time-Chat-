/**
 * Chat Routes
 * Routes for chat management (private and group chats)
 */

import { Router } from 'express';
import {
  accessChat,
  getChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  getChatById
} from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validation.js';

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/chats
 * @desc    Access or create a private chat
 * @access  Private
 * @body    { userId }
 */
router.post('/', accessChat);

/**
 * @route   GET /api/chats
 * @desc    Get all chats for current user
 * @access  Private
 */
router.get('/', getChats);

/**
 * @route   POST /api/chats/group
 * @desc    Create a new group chat
 * @access  Private
 * @body    { name, users: [userId1, userId2, ...] }
 */
router.post('/group', createGroupChat);

/**
 * @route   GET /api/chats/:id
 * @desc    Get a single chat by ID
 * @access  Private (Members only)
 */
router.get('/:id', validateObjectId('id'), getChatById);

/**
 * @route   PUT /api/chats/group/:id/rename
 * @desc    Rename a group chat
 * @access  Private (Admin only)
 * @body    { name }
 */
router.put('/group/:id/rename', validateObjectId('id'), renameGroup);

/**
 * @route   PUT /api/chats/group/:id/add
 * @desc    Add a user to a group chat
 * @access  Private (Admin only)
 * @body    { userId }
 */
router.put('/group/:id/add', validateObjectId('id'), addToGroup);

/**
 * @route   PUT /api/chats/group/:id/remove
 * @desc    Remove a user from a group chat (or leave)
 * @access  Private (Admin can remove anyone, users can remove themselves)
 * @body    { userId }
 */
router.put('/group/:id/remove', validateObjectId('id'), removeFromGroup);

export default router;
