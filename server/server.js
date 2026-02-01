/**
 * @fileoverview Server entry point
 * @description Initializes HTTP server, connects to database, Socket.io, and starts the application
 */

import dotenv from 'dotenv';
import http from 'http';

// Load environment variables first
dotenv.config();

import app from './src/app.js';
import { connectDatabase } from './src/config/database.js';
import initializeSocket from './src/socket/index.js';

const PORT = process.env.PORT || 5000;

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    const io = initializeSocket(server);

    // Make io accessible to routes if needed
    app.set('io', io);

    // Start the HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    /**
     * Handle unhandled promise rejections
     */
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection:', err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    /**
     * Handle uncaught exceptions
     */
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err.message);
      process.exit(1);
    });

    /**
     * Graceful shutdown handlers
     */
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Process terminated.');
      });
    });

    process.on('SIGINT', () => {
      console.log('👋 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Process terminated.');
      });
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
