/**
 * ChatSidebar Component
 * Main sidebar containing chat list and search functionality
 */

import { useState } from 'react';
import ChatList from './ChatList';
import UserSearchModal from './UserSearchModal';
import CreateGroupModal from './CreateGroupModal';
import ProfileModal from './ProfileModal';
import { ThemeToggle } from '../common';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import './ChatSidebar.css';

// API base URL for avatar display
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get full avatar URL
 */
const getAvatarUrl = (avatar) => {
  if (!avatar || avatar === 'default-avatar.png') {
    return '/default-avatar.png';
  }
  if (avatar.startsWith('http') || avatar.startsWith('/default')) {
    return avatar;
  }
  return `${API_URL}${avatar}`;
};

/**
 * ChatSidebar component displays chat list with search and create options
 * @param {Object} props - Component props
 * @param {Function} props.onChatSelect - Callback when a chat is selected (for mobile drawer close)
 */
const ChatSidebar = ({ onChatSelect }) => {
  const { user } = useAuth();
  const { loading } = useChat();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <aside className="chat-sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-user">
          <button 
            className="user-avatar-btn"
            onClick={() => setIsProfileOpen(true)}
            title="Edit Profile"
          >
            <div className="user-avatar">
              <img 
                src={getAvatarUrl(user?.avatar)} 
                alt={user?.name} 
                onError={(e) => { e.target.src = '/default-avatar.png'; }}
              />
              <span className="online-indicator" />
            </div>
            <div className="avatar-edit-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
          </button>
          <div className="user-info">
            <h3 className="user-name">{user?.name}</h3>
            <span className="user-status">{user?.status || 'Online'}</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Search and Actions */}
      <div className="sidebar-actions">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="action-buttons">
          <button 
            className="action-btn" 
            onClick={() => setIsSearchOpen(true)}
            title="New Chat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="12" y1="8" x2="12" y2="14" />
              <line x1="9" y1="11" x2="15" y2="11" />
            </svg>
          </button>
          <button 
            className="action-btn" 
            onClick={() => setIsGroupModalOpen(true)}
            title="New Group"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="sidebar-content">
        {loading ? (
          <div className="sidebar-loading">
            <div className="loading-spinner" />
            <span>Loading chats...</span>
          </div>
        ) : (
          <ChatList searchQuery={searchQuery} onChatSelect={onChatSelect} />
        )}
      </div>

      {/* Modals */}
      {isSearchOpen && (
        <UserSearchModal onClose={() => setIsSearchOpen(false)} onChatCreated={onChatSelect} />
      )}
      {isGroupModalOpen && (
        <CreateGroupModal onClose={() => setIsGroupModalOpen(false)} onChatCreated={onChatSelect} />
      )}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </aside>
  );
};

export default ChatSidebar;
