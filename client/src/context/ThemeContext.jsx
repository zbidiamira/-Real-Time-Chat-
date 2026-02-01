/**
 * Theme Context
 * Manages dark/light theme with localStorage persistence
 */

import { createContext, useState, useEffect, useCallback } from 'react';

// Create theme context
export const ThemeContext = createContext(null);

// Storage key for persisting theme preference
const THEME_STORAGE_KEY = 'chat_app_theme';

// Available themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

/**
 * Get initial theme from localStorage or system preference
 * @returns {string} Theme name
 */
const getInitialTheme = () => {
  try {
    // Check localStorage first
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && Object.values(THEMES).includes(stored)) {
      return stored;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEMES.DARK;
    }
  } catch (err) {
    console.warn('Could not get theme preference:', err);
  }
  
  return THEMES.LIGHT;
};

/**
 * Theme Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);

  /**
   * Apply theme to document
   */
  useEffect(() => {
    const root = document.documentElement;
    
    // Add transitioning class for smooth theme change
    setIsTransitioning(true);
    root.classList.add('theme-transitioning');
    
    // Remove previous theme class and add new one
    root.classList.remove(THEMES.LIGHT, THEMES.DARK);
    root.classList.add(theme);
    
    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === THEMES.DARK ? '#1a1a2e' : '#ffffff');
    }
    
    // Remove transitioning class after animation
    const timeout = setTimeout(() => {
      root.classList.remove('theme-transitioning');
      setIsTransitioning(false);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [theme]);

  /**
   * Save theme preference to localStorage
   */
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (err) {
      console.warn('Could not save theme preference:', err);
    }
  }, [theme]);

  /**
   * Listen for system theme changes
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
      }
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    // Legacy browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = useCallback(() => {
    setTheme((prev) => prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT);
  }, []);

  /**
   * Set specific theme
   * @param {string} newTheme - Theme to set
   */
  const setThemeMode = useCallback((newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
    }
  }, []);

  /**
   * Check if current theme is dark
   * @returns {boolean}
   */
  const isDark = theme === THEMES.DARK;

  const value = {
    theme,
    isDark,
    isTransitioning,
    toggleTheme,
    setTheme: setThemeMode,
    THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
