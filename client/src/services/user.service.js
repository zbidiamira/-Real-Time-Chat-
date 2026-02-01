/**
 * User Service
 * API calls for user operations
 */

import api from './api';

export const userService = {
  /**
   * Get all users (paginated)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} API response
   */
  getUsers: async (page = 1, limit = 10) => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Search users by name or email
   * @param {string} query - Search term
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} API response
   */
  searchUsers: async (query, page = 1, limit = 10) => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise} API response
   */
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Get current user's profile
   * @returns {Promise} API response
   */
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} profileData - { name?, avatar?, status? }
   * @returns {Promise} API response
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  }
};

export default userService;
