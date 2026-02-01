/**
 * User Controller
 * Handles user search, profile retrieval, and profile updates
 */

import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../utils/responseHandler.js';
import AppError from '../utils/AppError.js';

/**
 * @desc    Get all users (paginated)
 * @route   GET /api/users
 * @access  Private
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Exclude current user from results
  const query = { _id: { $ne: req.user._id } };

  const [users, total] = await Promise.all([
    User.find(query)
      .select('name email avatar status isOnline lastSeen createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query)
  ]);

  sendPaginated(res, {
    data: users,
    page,
    limit,
    total,
    message: 'Users retrieved successfully'
  });
});

/**
 * @desc    Search users by name or email
 * @route   GET /api/users/search
 * @access  Private
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  if (!q || q.trim().length === 0) {
    throw AppError.badRequest('Search query is required');
  }

  // Escape special regex characters for safety
  const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Search by name or email (case-insensitive), exclude current user
  const searchQuery = {
    $and: [
      { _id: { $ne: req.user._id } },
      {
        $or: [
          { name: { $regex: escapedQuery, $options: 'i' } },
          { email: { $regex: escapedQuery, $options: 'i' } }
        ]
      }
    ]
  };

  const [users, total] = await Promise.all([
    User.find(searchQuery)
      .select('name email avatar status isOnline lastSeen')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(searchQuery)
  ]);

  sendPaginated(res, {
    data: users,
    page,
    limit,
    total,
    message: 'Users found'
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('name email avatar status isOnline lastSeen createdAt')
    .lean();

  if (!user) {
    throw AppError.notFound('User not found');
  }

  sendSuccess(res, 200, 'User retrieved successfully', { user });
});

/**
 * @desc    Update current user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar, status } = req.body;
  const updateFields = {};

  // Only update fields that are provided
  if (name !== undefined) {
    if (name.trim().length < 2) {
      throw AppError.badRequest('Name must be at least 2 characters');
    }
    if (name.trim().length > 50) {
      throw AppError.badRequest('Name cannot exceed 50 characters');
    }
    updateFields.name = name.trim();
  }

  if (avatar !== undefined) {
    updateFields.avatar = avatar;
  }

  if (status !== undefined) {
    if (status.length > 100) {
      throw AppError.badRequest('Status cannot exceed 100 characters');
    }
    updateFields.status = status;
  }

  // Check if there are fields to update
  if (Object.keys(updateFields).length === 0) {
    throw AppError.badRequest('No valid fields provided for update');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select('name email avatar status isOnline lastSeen createdAt updatedAt');

  sendSuccess(res, 200, 'Profile updated successfully', { user });
});

/**
 * @desc    Get current user's profile (alias for /auth/me)
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('name email avatar status isOnline lastSeen createdAt updatedAt')
    .lean();

  sendSuccess(res, 200, 'Profile retrieved successfully', { user });
});
