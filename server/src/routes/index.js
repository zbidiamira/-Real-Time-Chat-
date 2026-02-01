/**
 * @fileoverview API Routes Index
 * @description Central routing configuration for all API endpoints
 */

import express from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import chatRoutes from './chat.routes.js';

const router = express.Router();

/**
 * Mount route modules
 */

// Health check routes
router.use('/health', healthRoutes);

// Authentication routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Chat routes
router.use('/chats', chatRoutes);

// Future routes will be added here:
// router.use('/messages', messageRoutes);

export default router;
