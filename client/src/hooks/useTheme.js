/**
 * useTheme Hook
 * Access theme context
 */

import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * Hook to access theme context
 * @returns {Object} Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default useTheme;
