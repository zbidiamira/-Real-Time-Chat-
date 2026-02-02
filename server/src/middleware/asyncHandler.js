/**
 * @fileoverview Async Handler Middleware
 * @description Wraps async route handlers to catch errors and pass them to the error handler
 */

/**
 * Wrap an async function to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
