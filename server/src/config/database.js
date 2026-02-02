/**
 * @fileoverview MongoDB Database Configuration
 * @description Handles MongoDB connection using Mongoose with proper error handling and reconnection logic
 */

import mongoose from 'mongoose';

/**
 * Database connection state
 */
let isConnected = false;

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
export const connectDatabase = async () => {
  // Prevent multiple connections
  if (isConnected) {
    console.log('📦 Using existing database connection');
    return;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    // Mongoose connection options
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoUri, options);

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

/**
 * Get database connection status
 * @returns {string} Connection state description
 */
export const getDatabaseStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
export const disconnectDatabase = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('📦 MongoDB Disconnected');
  } catch (error) {
    console.error(`❌ MongoDB Disconnect Error: ${error.message}`);
    throw error;
  }
};

// ======================
// Connection Event Handlers
// ======================

mongoose.connection.on('connected', () => {
  console.log('📦 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('📦 Mongoose disconnected from MongoDB');
  isConnected = false;
});

// ======================
// Graceful Shutdown Handlers
// ======================

/**
 * Handle graceful shutdown
 * @param {string} signal - The signal that triggered shutdown
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Closing MongoDB connection...`);
  try {
    await disconnectDatabase();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle process termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default {
  connectDatabase,
  getDatabaseStatus,
  disconnectDatabase
};
