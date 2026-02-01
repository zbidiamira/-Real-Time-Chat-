/**
 * UserSearchModal Component
 * Modal for searching and starting chats with users
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { userService } from '../../services/user.service';
import { useChat } from '../../hooks/useChat';
import { useToast } from '../../hooks/useToast';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Input from '../common/Input';
import './UserSearchModal.css';

/**
 * UserSearchModal component for user search and chat creation
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Close handler
 */
const UserSearchModal = ({ onClose }) => {
  const { accessChat } = useChat();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setSearching(true);
    try {
      const response = await userService.searchUsers(query);
      // API returns { success, message, data: [...users], pagination }
      setUsers(response.data || []);
    } catch (err) {
      console.error('Search failed:', err);
      showToast('error', 'Failed to search users');
    } finally {
      setSearching(false);
    }
  }, [showToast]);

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  // Handle user selection
  const handleSelectUser = async (user) => {
    setLoading(true);
    try {
      await accessChat(user._id);
      showToast('success', `Chat with ${user.name} opened`);
      onClose();
    } catch (err) {
      showToast('error', 'Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>New Chat</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="modal-body">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={handleInputChange}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            }
          />

          {/* Results */}
          <div className="search-results">
            {searching && (
              <div className="search-loading">
                <div className="spinner" />
                <span>Searching...</span>
              </div>
            )}

            {!searching && searchQuery && users.length === 0 && (
              <div className="search-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M8 8l6 6M14 8l-6 6" />
                </svg>
                <p>No users found</p>
                <span>Try a different search term</span>
              </div>
            )}

            {!searching && !searchQuery && (
              <div className="search-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <p>Search for users</p>
                <span>Enter a name or email to find users</span>
              </div>
            )}

            {!searching && users.length > 0 && (
              <ul className="user-list">
                {users.map((user) => (
                  <li key={user._id}>
                    <button
                      className="user-item"
                      onClick={() => handleSelectUser(user)}
                      disabled={loading}
                    >
                      <Avatar 
                        src={user.avatar} 
                        name={user.name} 
                        size="md"
                        showOnline={user.isOnline}
                      />
                      <div className="user-item-info">
                        <span className="user-item-name">{user.name}</span>
                        <span className="user-item-email">{user.email}</span>
                      </div>
                      <svg className="user-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
