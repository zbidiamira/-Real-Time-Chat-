/**
 * @fileoverview API Routes Index
 * @description Central routing configuration for all API endpoints
 */

import express from 'express';
import healthRoutes from './health.routes.js';

const router = express.Router();

/**
 * Mount route modules
 */

// Health check routes
router.use('/health', healthRoutes);

// Future routes will be added here:
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/chats', chatRoutes);
// router.use('/messages', messageRoutes);

export default router;
