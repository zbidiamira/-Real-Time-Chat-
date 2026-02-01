/**
 * @fileoverview API Routes Index
 * @description Central routing configuration for all API endpoints
 */

import express from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';

const router = express.Router();

/**
 * Mount route modules
 */

// Health check routes
router.use('/health', healthRoutes);

// Authentication routes
router.use('/auth', authRoutes);

// Future routes will be added here:
// router.use('/users', userRoutes);
// router.use('/chats', chatRoutes);
// router.use('/messages', messageRoutes);

export default router;
