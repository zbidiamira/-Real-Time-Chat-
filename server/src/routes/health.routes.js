/**
 * @fileoverview Health Check Routes
 * @description API routes for server health monitoring
 */

import express from 'express';
import { getDatabaseStatus } from '../config/database.js';
import { sendSuccess } from '../utils/responseHandler.js';

const router = express.Router();

/**
 * @route GET /api/health
 * @description Health check endpoint to verify server and database status
 * @access Public
 */
router.get('/', (req, res) => {
  const healthData = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: getDatabaseStatus(),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  };

  sendSuccess(res, 200, 'Server is healthy', healthData);
});

/**
 * @route GET /api/health/ping
 * @description Simple ping endpoint for quick health checks
 * @access Public
 */
router.get('/ping', (req, res) => {
  sendSuccess(res, 200, 'pong');
});

export default router;
