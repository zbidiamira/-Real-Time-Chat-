/**
 * Chat Service
 * API calls for chat operations
 */

import api from './api';

export const chatService = {
  /**
   * Get all chats for current user
   * @returns {Promise} API response with chats
   */
  getChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  /**
   * Access or create a private chat
   * @param {string} userId - User ID to chat with
   * @returns {Promise} API response with chat
   */
  accessChat: async (userId) => {
    const response = await api.post('/chats', { userId });
    return response.data;
  },

  /**
   * Create a group chat
   * @param {Object} groupData - { name, users }
   * @returns {Promise} API response with created group
   */
  createGroup: async (groupData) => {
    const response = await api.post('/chats/group', groupData);
    return response.data;
  },

  /**
   * Rename a group chat
   * @param {string} chatId - Chat ID
   * @param {string} name - New group name
   * @returns {Promise} API response with updated chat
   */
  renameGroup: async (chatId, name) => {
    const response = await api.put(`/chats/group/${chatId}/rename`, { chatName: name });
    return response.data;
  },

  /**
   * Add user to group chat
   * @param {string} chatId - Chat ID
   * @param {string} userId - User ID to add
   * @returns {Promise} API response with updated chat
   */
  addToGroup: async (chatId, userId) => {
    const response = await api.put(`/chats/group/${chatId}/add`, { userId });
    return response.data;
  },

  /**
   * Remove user from group chat
   * @param {string} chatId - Chat ID
   * @param {string} userId - User ID to remove
   * @returns {Promise} API response with updated chat
   */
  removeFromGroup: async (chatId, userId) => {
    const response = await api.put(`/chats/group/${chatId}/remove`, { userId });
    return response.data;
  }
};

export default chatService;
