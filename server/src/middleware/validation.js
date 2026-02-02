/**
 * @fileoverview Input Validation Middleware
 * @description Validates request body for various endpoints
 */

import AppError from '../utils/AppError.js';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validate registration input
 * @middleware
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  // Validate name
  if (!name || typeof name !== 'string') {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (name.trim().length > 50) {
    errors.push('Name cannot exceed 50 characters');
  }

  // Validate email
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Validate password
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join('. '), 400));
  }

  // Sanitize input
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
};

/**
 * Validate login input
 * @middleware
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validate email
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Validate password
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join('. '), 400));
  }

  // Sanitize input
  req.body.email = email.trim().toLowerCase();

  next();
};

/**
 * Validate password update input
 * @middleware
 */
export const validatePasswordUpdate = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push('Current password is required');
  }

  if (!newPassword) {
    errors.push('New password is required');
  } else if (newPassword.length < 6) {
    errors.push('New password must be at least 6 characters');
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push('New password must be different from current password');
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join('. '), 400));
  }

  next();
};

/**
 * Validate profile update input
 * @middleware
 */
export const validateProfileUpdate = (req, res, next) => {
  const { name, status } = req.body;
  const errors = [];

  if (name !== undefined) {
    if (typeof name !== 'string') {
      errors.push('Name must be a string');
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    } else if (name.trim().length > 50) {
      errors.push('Name cannot exceed 50 characters');
    } else {
      req.body.name = name.trim();
    }
  }

  if (status !== undefined) {
    if (typeof status !== 'string') {
      errors.push('Status must be a string');
    } else if (status.length > 150) {
      errors.push('Status cannot exceed 150 characters');
    }
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join('. '), 400));
  }

  next();
};

/**
 * Validate MongoDB ObjectId parameter
 * @param {string} paramName - Name of the parameter to validate
 * @returns {Function} Middleware function
 */
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!id || !objectIdRegex.test(id)) {
      return next(new AppError(`Invalid ${paramName} format`, 400));
    }

    next();
  };
};

export default {
  validateRegister,
  validateLogin,
  validatePasswordUpdate,
  validateProfileUpdate,
  validateObjectId
};
