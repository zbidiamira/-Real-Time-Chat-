/**
 * Upload Controller
 * Handles file upload operations
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/responseHandler.js';
import AppError from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get file type based on mimetype
 * @param {string} mimetype - File mimetype
 * @returns {string} 'image' or 'file'
 */
const getFileType = (mimetype) => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return imageTypes.includes(mimetype) ? 'image' : 'file';
};

/**
 * @desc    Upload avatar image
 * @route   POST /api/upload/avatar
 * @access  Private
 */
export const uploadUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw AppError.badRequest('Please upload an image file');
  }

  // Get the uploaded file path (relative URL for serving)
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  // Get user's current avatar to delete old one
  const user = await User.findById(req.user._id);
  const oldAvatar = user.avatar;

  // Update user's avatar in database
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { new: true }
  ).select('name email avatar status isOnline lastSeen createdAt updatedAt');

  // Delete old avatar file if it exists and isn't the default
  if (oldAvatar && oldAvatar !== 'default-avatar.png' && oldAvatar.startsWith('/uploads/')) {
    const oldAvatarPath = path.join(__dirname, '../..', oldAvatar);
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlink(oldAvatarPath, (err) => {
        if (err) console.error('Error deleting old avatar:', err);
      });
    }
  }

  sendSuccess(res, 200, 'Avatar uploaded successfully', { 
    user: updatedUser,
    avatarUrl 
  });
});

/**
 * @desc    Delete avatar (reset to default)
 * @route   DELETE /api/upload/avatar
 * @access  Private
 */
export const deleteUserAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const currentAvatar = user.avatar;

  // Reset to default avatar
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: 'default-avatar.png' },
    { new: true }
  ).select('name email avatar status isOnline lastSeen createdAt updatedAt');

  // Delete current avatar file if it exists and isn't the default
  if (currentAvatar && currentAvatar !== 'default-avatar.png' && currentAvatar.startsWith('/uploads/')) {
    const avatarPath = path.join(__dirname, '../..', currentAvatar);
    if (fs.existsSync(avatarPath)) {
      fs.unlink(avatarPath, (err) => {
        if (err) console.error('Error deleting avatar:', err);
      });
    }
  }

  sendSuccess(res, 200, 'Avatar removed successfully', { user: updatedUser });
});

/**
 * @desc    Upload media files for chat messages
 * @route   POST /api/upload/media
 * @access  Private
 */
export const uploadChatMedia = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw AppError.badRequest('Please upload at least one file');
  }

  // Process uploaded files
  const attachments = req.files.map(file => ({
    url: `/uploads/media/${file.filename}`,
    type: getFileType(file.mimetype),
    name: file.originalname,
    size: file.size,
    mimetype: file.mimetype
  }));

  sendSuccess(res, 200, 'Files uploaded successfully', { attachments });
});
