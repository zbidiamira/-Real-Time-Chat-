/**
 * Upload Routes
 * Routes for file upload operations
 */

import { Router } from 'express';
import { uploadUserAvatar, deleteUserAvatar, uploadChatMedia } from '../controllers/upload.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadAvatar, uploadMedia, handleUploadError } from '../middleware/upload.middleware.js';

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

/**
 * @route   POST /api/upload/media
 * @desc    Upload media files for chat messages
 * @access  Private
 * @body    FormData with 'media' field containing up to 5 files
 */
router.post('/media', uploadMedia, handleUploadError, uploadChatMedia);

export default router;
