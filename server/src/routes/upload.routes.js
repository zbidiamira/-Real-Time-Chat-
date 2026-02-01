/**
 * Upload Routes
 * Routes for file upload operations
 */

import { Router } from 'express';
import { uploadUserAvatar, deleteUserAvatar } from '../controllers/upload.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadAvatar, handleUploadError } from '../middleware/upload.middleware.js';

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar
 * @access  Private
 * @body    FormData with 'avatar' field containing image file
 */
router.post('/avatar', uploadAvatar, handleUploadError, uploadUserAvatar);

/**
 * @route   DELETE /api/upload/avatar
 * @desc    Delete user avatar (reset to default)
 * @access  Private
 */
router.delete('/avatar', deleteUserAvatar);

export default router;
