/**
 * @fileoverview Authentication Middleware
 * @description Protects routes by verifying JWT tokens
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from './asyncHandler.js';

/**
 * Protect routes - Verify JWT token and attach user to request
 * @middleware
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(AppError.unauthorized('Access denied. No token provided.'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from decoded token
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(AppError.unauthorized('User no longer exists.'));
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(AppError.unauthorized('Invalid token. Please log in again.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Token expired. Please log in again.'));
    }
    return next(AppError.unauthorized('Authentication failed.'));
  }
});

/**
 * Optional authentication - Attach user if token exists, but don't require it
 * @middleware
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid, but that's okay for optional auth
    }
  }

  next();
});

/**
 * Restrict access to specific roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('You do not have permission to perform this action.'));
    }
    next();
  };
};

export default {
  protect,
  optionalAuth,
  restrictTo
};
