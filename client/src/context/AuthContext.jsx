/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

// Create auth context
export const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        setUser(response.data.user);
        setToken(storedToken);
      } catch (err) {
        // Token is invalid or expired
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  const register = useCallback(async (userData) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.register(userData);
      const { user: newUser, token: newToken } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      
      // Update state
      setUser(newUser);
      setToken(newToken);
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Login response
   */
  const login = useCallback(async (credentials) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login(credentials);
      const { user: loggedInUser, token: newToken } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      
      // Update state
      setUser(loggedInUser);
      setToken(newToken);
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      // Call logout API if token exists
      if (token) {
        await authService.logout();
      }
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      // Always clear local state
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setError(null);
    }
  }, [token]);

  /**
   * Update user data in context
   * @param {Object} userData - Updated user data
   */
  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    register,
    login,
    logout,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
