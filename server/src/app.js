/**
 * @fileoverview Express application setup
 * @description Configures Express app with middleware and routes
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import routes from './routes/index.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';

// Import utilities
import AppError from './utils/AppError.js';
import { sendSuccess } from './utils/responseHandler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ======================
// Security Middleware
// ======================

// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

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
// Static Files
// ======================

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ======================
// Root Route
// ======================

/**
 * @route GET /
 * @description Root endpoint
 * @access Public
 */
app.get('/', (req, res) => {
  sendSuccess(res, 200, 'Welcome to Chat App API', {
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// ======================
// API Routes
// ======================

app.use('/api', routes);

// ======================
// 404 Handler
// ======================

/**
 * Handle undefined routes
 */
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

// ======================
// Global Error Handler
// ======================

app.use(errorHandler);

export default app;
