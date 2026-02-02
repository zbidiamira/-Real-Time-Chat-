/**
 * @fileoverview Authentication Controller
 * @description Handles user registration, login, logout, and profile retrieval
 */

import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandler.js';
import asyncHandler from '../middleware/asyncHandler.js';

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(AppError.badRequest('User with this email already exists'));
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password
  });

  // Generate JWT token
  const token = user.generateAuthToken();

  // Update online status
  user.isOnline = true;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, 201, 'Registration successful', {
    user,
    token
  });
});

/**
 * @route POST /api/auth/login
 * @description Login user and return token
 * @access Public
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email (include password for comparison)
  const user = await User.findByEmail(email);

  if (!user) {
    return next(AppError.unauthorized('Invalid email or password'));
  }

  // Check if password matches
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return next(AppError.unauthorized('Invalid email or password'));
  }

  // Generate JWT token
  const token = user.generateAuthToken();

  // Update online status and last seen
  user.isOnline = true;
  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, 200, 'Login successful', {
    user,
    token
  });
});

/**
 * @route GET /api/auth/me
 * @description Get current logged in user profile
 * @access Private
 */
export const getMe = asyncHandler(async (req, res) => {
  // User is already attached to req by auth middleware
  const user = await User.findById(req.user._id);

  sendSuccess(res, 200, 'User profile retrieved', {
    user
  });
});

/**
 * @route POST /api/auth/logout
 * @description Logout user (update online status)
 * @access Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Update user's online status
  await User.findByIdAndUpdate(req.user._id, {
    isOnline: false,
    lastSeen: new Date()
  });

  sendSuccess(res, 200, 'Logout successful');
});

/**
 * @route PUT /api/auth/password
 * @description Update user password
 * @access Private
 */
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password field
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    return next(AppError.unauthorized('Current password is incorrect'));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = user.generateAuthToken();

  sendSuccess(res, 200, 'Password updated successfully', {
    token
  });
});

export default {
  register,
  login,
  getMe,
  logout,
  updatePassword
};
