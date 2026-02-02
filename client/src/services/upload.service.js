/**
 * Upload Service
 * API calls for file upload operations
 */

import api from './api';

export const uploadService = {
  /**
   * Upload avatar image
   * @param {File} file - Image file to upload
   * @returns {Promise} API response with avatar URL
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Delete avatar (reset to default)
   * @returns {Promise} API response
   */
  deleteAvatar: async () => {
    const response = await api.delete('/upload/avatar');
    return response.data;
  },

  /**
   * Upload media files for chat messages
   * @param {File[]} files - Array of files to upload
   * @param {Function} onProgress - Optional progress callback
   * @returns {Promise} API response with attachments array
   */
  uploadMedia: async (files, onProgress) => {
    const formData = new FormData();
    
    // Append all files
    files.forEach(file => {
      formData.append('media', file);
    });
    
    const response = await api.post('/upload/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      }
    });
    return response.data;
  },

  /**
   * Get full URL for a media file
   * @param {string} path - Relative path from server
   * @returns {string} Full URL
   */
  getMediaUrl: (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  },

  /**
   * Check if file is an image based on mimetype
   * @param {string} mimetype - File mimetype
   * @returns {boolean}
   */
  isImage: (mimetype) => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(mimetype);
  },

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size string
   */
  formatFileSize: (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get file icon based on file type
   * @param {string} filename - Original filename
   * @param {string} mimetype - File mimetype
   * @returns {string} Icon name
   */
  getFileIcon: (filename, mimetype) => {
    if (!filename) return 'file';
    
    const ext = filename.split('.').pop()?.toLowerCase();
    
    // Document types
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['txt'].includes(ext)) return 'text';
    if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
    
    // Image types
    if (mimetype?.startsWith('image/')) return 'image';
    
    return 'file';
  }
};

export default uploadService;
