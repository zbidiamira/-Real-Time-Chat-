/**
 * useAuth Hook
 * Custom hook to access auth context
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Access authentication context
 * @returns {Object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
