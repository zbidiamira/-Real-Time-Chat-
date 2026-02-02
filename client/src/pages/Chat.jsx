/**
 * Chat Page Component
 * Main chat interface with sidebar and chat window
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useGlobalNotifications } from '../hooks/useGlobalNotifications';
import { ChatSidebar, ChatWindow } from '../components/chat';
import './Chat.css';

/**
 * Chat page component - Main authenticated view
 */
const Chat = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Enable global notification listener for incoming messages
  useGlobalNotifications();

  /**
   * Handle responsive detection
   */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar when switching to desktop
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Toggle sidebar on mobile
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  /**
   * Close sidebar (for mobile)
   */
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      showToast('success', 'You have been logged out successfully.');
      navigate('/login', { replace: true });
    } catch (err) {
      showToast('error', 'Logout failed. Please try again.');
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="chat-page">
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="sidebar-overlay visible" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <ChatSidebar 
          onLogout={handleLogout} 
          onChatSelect={isMobile ? closeSidebar : undefined}
        />
      </div>
      
      {/* Chat Window */}
      <ChatWindow 
        onMenuClick={toggleSidebar}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Chat;
