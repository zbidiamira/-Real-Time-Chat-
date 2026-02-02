/**
 * useSocket Hook
 * Custom hook for accessing socket context
 */

import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

/**
 * Hook to access socket context
 * @returns {Object} Socket context value
 * @throws {Error} If used outside SocketProvider
 */
export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  return context;
};

export default useSocket;
