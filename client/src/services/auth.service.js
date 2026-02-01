/**
 * Auth Service
 * API calls for authentication operations
 */

import api from './api';

export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   * @returns {Promise} API response
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} API response
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get current user profile
   * @returns {Promise} API response
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise} API response
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Update password
   * @param {Object} passwordData - { currentPassword, newPassword }
   * @returns {Promise} API response
   */
  updatePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  }
};

export default authService;
