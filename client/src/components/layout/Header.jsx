/**
 * Header Component
 * App header with user menu and actions
 */

import { useState, useRef, useEffect } from 'react';
import { Avatar } from '../common';
import './Header.css';

/**
 * Header component
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user
 * @param {Function} props.onLogout - Logout handler
 * @param {Function} props.onProfileClick - Profile click handler
 * @param {Function} props.onThemeToggle - Theme toggle handler
 * @param {string} props.theme - Current theme
 */
const Header = ({ 
  user, 
  onLogout, 
  onProfileClick, 
  onThemeToggle,
  theme = 'light'
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuToggle = () => {
    setMenuOpen(prev => !prev);
  };

  const handleProfileClick = () => {
    setMenuOpen(false);
    onProfileClick?.();
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout?.();
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-title">Chats</h1>
      </div>

      <div className="header-right">
        {/* Theme Toggle */}
        <button 
          className="header-action"
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* User Menu */}
        <div className="user-menu" ref={menuRef}>
          <button 
            className="user-menu-trigger"
            onClick={handleMenuToggle}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <Avatar 
              name={user?.name} 
              src={user?.avatar} 
              size="sm"
              showOnline={false}
            />
            <span className="user-name">{user?.name}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {menuOpen && (
            <div className="user-menu-dropdown">
              <div className="menu-header">
                <Avatar 
                  name={user?.name} 
                  src={user?.avatar} 
                  size="md"
                />
                <div className="menu-user-info">
                  <span className="menu-user-name">{user?.name}</span>
                  <span className="menu-user-email">{user?.email}</span>
                </div>
              </div>
              
              <div className="menu-divider" />
              
              <button 
                className="menu-item"
                onClick={handleProfileClick}
              >
                <span className="menu-icon">👤</span>
                <span>Profile</span>
              </button>
              
              <button 
                className="menu-item"
                onClick={onThemeToggle}
              >
                <span className="menu-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
              
              <div className="menu-divider" />
              
              <button 
                className="menu-item menu-item-danger"
                onClick={handleLogout}
              >
                <span className="menu-icon">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
