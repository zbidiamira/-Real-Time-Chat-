/**
 * @fileoverview Custom Application Error Class
 * @description Extends Error class with status code and operational flag for better error handling
 */

/**
 * Custom error class for application errors
 * @extends Error
 */
class AppError extends Error {
  /**
   * Create an AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a 400 Bad Request error
   * @param {string} message - Error message
   * @returns {AppError}
   */
  static badRequest(message = 'Bad Request') {
    return new AppError(message, 400);
  }

  /**
   * Create a 401 Unauthorized error
   * @param {string} message - Error message
   * @returns {AppError}
   */
  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }

  /**
   * Create a 403 Forbidden error
   * @param {string} message - Error message
   * @returns {AppError}
   */
  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  /**
   * Create a 404 Not Found error
   * @param {string} message - Error message
   * @returns {AppError}
   */
  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  /**
   * Create a 409 Conflict error
   * @param {string} message - Error message
   * @returns {AppError}
   */
  static conflict(message = 'Resource already exists') {
    return new AppError(message, 409);
  }

  /**
   * Create a 422 Unprocessable Entity error
   * @param {string} message - Error message
   * @returns {AppError}
   */
  static unprocessable(message = 'Unprocessable Entity') {
    return new AppError(message, 422);
  }

  /**
   * Create a 500 Internal Server Error
   * @param {string} message - Error message
   * @returns {AppError}
   */
  static internal(message = 'Internal Server Error') {
    return new AppError(message, 500);
  }
}

export default AppError;
