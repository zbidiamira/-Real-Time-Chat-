/**
 * Message Service
 * API calls for message operations
 */

import api from './api';

export const messageService = {
  /**
   * Get messages for a chat
   * @param {string} chatId - Chat ID
   * @param {number} page - Page number
   * @param {number} limit - Messages per page
   * @returns {Promise} API response with messages
   */
  getMessages: async (chatId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/${chatId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Send a message
   * @param {Object} messageData - { chatId, content, type? }
   * @returns {Promise} API response with created message
   */
  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  /**
   * Mark messages as read
   * @param {string} chatId - Chat ID
   * @returns {Promise} API response
   */
  markAsRead: async (chatId) => {
    const response = await api.put(`/messages/${chatId}/read`);
    return response.data;
  }
};

export default messageService;
