/**
 * @fileoverview Authentication Routes
 * @description API routes for user authentication
 */

import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  updatePassword
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  validateRegister,
  validateLogin,
  validatePasswordUpdate
} from '../middleware/validation.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
router.post('/register', validateRegister, register);

/**
 * @route POST /api/auth/login
 * @description Login user
 * @access Public
 */
router.post('/login', validateLogin, login);

/**
 * @route GET /api/auth/me
 * @description Get current user profile
 * @access Private
 */
router.get('/me', protect, getMe);

/**
 * @route POST /api/auth/logout
 * @description Logout user
 * @access Private
 */
router.post('/logout', protect, logout);

/**
 * @route PUT /api/auth/password
 * @description Update user password
 * @access Private
 */
router.put('/password', protect, validatePasswordUpdate, updatePassword);

export default router;
