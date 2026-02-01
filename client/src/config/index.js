/**
 * @fileoverview Application configuration
 * @description Centralized configuration for the client application
 */

/**
 * API Configuration
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Socket Configuration
 */
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Application Constants
 */
export const APP_NAME = 'Chat App';
export const APP_VERSION = '1.0.0';

/**
 * Pagination Defaults
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * File Upload Limits
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

/**
 * Timing Constants (in milliseconds)
 */
export const DEBOUNCE_DELAY = 300;
export const TYPING_TIMEOUT = 3000;
export const RECONNECT_INTERVAL = 5000;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  TOKEN: 'chat_app_token',
  USER: 'chat_app_user',
  THEME: 'chat_app_theme'
};
