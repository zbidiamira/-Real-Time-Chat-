/**
 * User Routes
 * Routes for user search, profile retrieval, and profile updates
 */

import { Router } from 'express';
import {
  getAllUsers,
  searchUsers,
  getUserById,
  updateProfile,
  getProfile
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validation.js';

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/users
 * @desc    Get all users (paginated)
 * @access  Private
 */
router.get('/', getAllUsers);

/**
 * @route   GET /api/users/search
 * @desc    Search users by name or email
 * @access  Private
 * @query   q - Search term (required)
 * @query   page - Page number (default: 1)
 * @query   limit - Results per page (default: 10)
 */
router.get('/search', searchUsers);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 * @body    { name?, avatar?, status? }
 */
router.put('/profile', updateProfile);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', validateObjectId('id'), getUserById);

export default router;
