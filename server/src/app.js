/**
 * @fileoverview Express application setup
 * @description Configures Express app with middleware and routes
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// ======================
// Security Middleware
// ======================

// Set security HTTP headers
app.use(helmet());

// Enable CORS with credentials
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ======================
// Body Parsing Middleware
// ======================

// Parse JSON bodies (limit to 10mb)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
// Logging Middleware
// ======================

// HTTP request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ======================
// Health Check Route
// ======================

/**
 * @route GET /api/health
 * @description Health check endpoint to verify server status
 * @access Public
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// ======================
// Root Route
// ======================

/**
 * @route GET /
 * @description Root endpoint
 * @access Public
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Chat App API',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// ======================
// 404 Handler
// ======================

/**
 * Handle undefined routes
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: 'Route not found'
  });
});

// ======================
// Global Error Handler
// ======================

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
