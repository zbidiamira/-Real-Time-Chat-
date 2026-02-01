/**
 * Date Utilities
 * Helper functions for date formatting
 */

/**
 * Format a date as relative time (e.g., "2m ago", "1h ago", "Yesterday")
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted relative time
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }

  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // Format as date for older messages
  return then.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a date as time (e.g., "10:30 AM")
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time
 */
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format a date as full date and time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format a date for message grouping (e.g., "Today", "Yesterday", "January 15")
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date for grouping
 */
export const formatMessageDate = (date) => {
  const now = new Date();
  const then = new Date(date);
  
  // Reset time to compare dates only
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thenDate = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  
  const diffInDays = Math.floor((nowDate - thenDate) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  }

  if (diffInDays === 1) {
    return 'Yesterday';
  }

  if (diffInDays < 7) {
    return then.toLocaleDateString('en-US', { weekday: 'long' });
  }

  return then.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: now.getFullYear() !== then.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Check if two dates are the same day
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {boolean} True if same day
 */
export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export default {
  formatRelativeTime,
  formatTime,
  formatDateTime,
  formatMessageDate,
  isSameDay
};
