/**
 * useChat Hook
 * Custom hook for accessing chat context
 */

import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

/**
 * Hook to access chat context
 * @returns {Object} Chat context value
 * @throws {Error} If used outside ChatProvider
 */
export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  return context;
};

export default useChat;
