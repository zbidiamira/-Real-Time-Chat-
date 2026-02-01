/**
 * ChatSidebar Component
 * Main sidebar containing chat list and search functionality
 */

import { useState } from 'react';
import ChatList from './ChatList';
import UserSearchModal from './UserSearchModal';
import CreateGroupModal from './CreateGroupModal';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import './ChatSidebar.css';

/**
 * ChatSidebar component displays chat list with search and create options
 */
const ChatSidebar = () => {
  const { user } = useAuth();
  const { loading } = useChat();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <aside className="chat-sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-user">
          <div className="user-avatar">
            <img 
              src={user?.avatar || '/default-avatar.png'} 
              alt={user?.name} 
              onError={(e) => { e.target.src = '/default-avatar.png'; }}
            />
            <span className="online-indicator" />
          </div>
          <div className="user-info">
            <h3 className="user-name">{user?.name}</h3>
            <span className="user-status">{user?.status || 'Online'}</span>
          </div>
        </div>
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
          <ChatList searchQuery={searchQuery} />
        )}
      </div>

      {/* Modals */}
      {isSearchOpen && (
        <UserSearchModal onClose={() => setIsSearchOpen(false)} />
      )}
      {isGroupModalOpen && (
        <CreateGroupModal onClose={() => setIsGroupModalOpen(false)} />
      )}
    </aside>
  );
};

export default ChatSidebar;
