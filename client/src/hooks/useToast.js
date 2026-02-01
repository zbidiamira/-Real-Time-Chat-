/**
 * useToast Hook
 * Custom hook for toast notifications with unified API
 */

import { useContext } from 'react';
import ToastContext from '../context/ToastContext';

/**
 * Hook to access toast notifications
 * @returns {Object} Toast methods
 */
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  // Provide both APIs for flexibility
  return {
    ...context,
    showToast: (type, message, duration) => {
      if (context[type]) {
        context[type](message, duration);
      }
    }
  };
};

export default useToast;
