/**
 * @fileoverview Custom hook for error handling
 * @description Provides utilities for handling errors throughout the application
 */

import { useState, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Get error type from error object
 * @param {Error|Object} error - The error object
 * @returns {string} The error type
 */
const getErrorType = (error) => {
  if (!error.response) {
    return ERROR_TYPES.NETWORK;
  }
  
  const status = error.response?.status;
  
  switch (status) {
    case 400:
      return ERROR_TYPES.VALIDATION;
    case 401:
    case 403:
      return ERROR_TYPES.AUTH;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 500:
    case 502:
    case 503:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};

/**
 * Get user-friendly error message
 * @param {Error|Object} error - The error object
 * @returns {string} User-friendly error message
 */
const getErrorMessage = (error) => {
  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ERR_NETWORK') {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'The request took too long. Please try again.';
    }
    return error.message || 'An unexpected error occurred.';
  }
  
  // API error with response
  const { data, status } = error.response;
  
  // Use server-provided message if available
  if (data?.message) {
    return data.message;
  }
  
  // Default messages based on status code
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The resource may already exist.';
    case 422:
      return 'The provided data is invalid.';
    case 429:
      return 'Too many requests. Please wait and try again.';
    case 500:
      return 'A server error occurred. Please try again later.';
    case 502:
    case 503:
      return 'The service is temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred.';
  }
};

/**
 * Custom hook for error handling
 * @returns {Object} Error handling utilities
 */
export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isError, setIsError] = useState(false);
  const { showToast } = useToast();
  
  /**
   * Handle error and show toast notification
   * @param {Error|Object} error - The error to handle
   * @param {Object} options - Options for error handling
   * @param {boolean} options.showToast - Whether to show toast notification
   * @param {string} options.fallbackMessage - Fallback message if error message is not available
   * @param {Function} options.onError - Callback when error occurs
   */
  const handleError = useCallback((error, options = {}) => {
    const { 
      showToast: shouldShowToast = true, 
      fallbackMessage = 'An error occurred',
      onError
    } = options;
    
    const errorType = getErrorType(error);
    const errorMessage = getErrorMessage(error) || fallbackMessage;
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`[${errorType}]`, error);
    }
    
    // Set error state
    setError({
      type: errorType,
      message: errorMessage,
      originalError: error,
      timestamp: new Date().toISOString()
    });
    setIsError(true);
    
    // Show toast notification
    if (shouldShowToast) {
      showToast(errorMessage, 'error');
    }
    
    // Call error callback if provided
    if (onError && typeof onError === 'function') {
      onError(error, errorType);
    }
    
    // Return error info for further handling
    return {
      type: errorType,
      message: errorMessage
    };
  }, [showToast]);
  
  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);
  
  /**
   * Wrap async function with error handling
   * @param {Function} asyncFn - Async function to wrap
   * @param {Object} options - Error handling options
   * @returns {Function} Wrapped function
   */
  const withErrorHandling = useCallback((asyncFn, options = {}) => {
    return async (...args) => {
      try {
        clearError();
        return await asyncFn(...args);
      } catch (err) {
        handleError(err, options);
        throw err; // Re-throw for further handling if needed
      }
    };
  }, [handleError, clearError]);
  
  return {
    error,
    isError,
    handleError,
    clearError,
    withErrorHandling,
    ERROR_TYPES
  };
};

export default useErrorHandler;
