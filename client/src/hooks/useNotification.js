/**
 * useNotification Hook
 * Custom hook to access notification context
 */

import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

/**
 * Hook to use notification context
 * @returns {Object} Notification context value
 * @throws {Error} If used outside NotificationProvider
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

export default useNotification;
