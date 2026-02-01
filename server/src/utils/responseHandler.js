/**
 * @fileoverview Response Handler Utility
 * @description Provides consistent response format for all API endpoints
 */

/**
 * Send a success response
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} errors - Additional error details
 */
export const sendError = (res, statusCode = 500, message = 'Error', errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 * @param {Response} res - Express response object
 * @param {Object} options - Pagination options
 * @param {Array} options.data - Array of data items
 * @param {number} options.page - Current page number
 * @param {number} options.limit - Items per page
 * @param {number} options.total - Total number of items
 * @param {string} options.message - Success message
 */
export const sendPaginated = (res, { data, page, limit, total, message = 'Success' }) => {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: totalPages,
      hasMore
    }
  });
};

export default {
  sendSuccess,
  sendError,
  sendPaginated
};
