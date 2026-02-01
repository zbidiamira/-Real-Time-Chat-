/**
 * AddMemberModal Component
 * Modal for searching and adding members to a group
 */

import { useState, useCallback, useRef } from 'react';
import { userService } from '../../services/user.service';
import { useChat } from '../../hooks/useChat';
import { useToast } from '../../hooks/useToast';
import { Modal, Button, Input } from '../common';
import './AddMemberModal.css';

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
 * AddMemberModal component
 * @param {Object} props - Component props
 * @param {Object} props.chat - Current chat object
 * @param {Function} props.onClose - Close handler
 */
const AddMemberModal = ({ chat, onClose }) => {
  const { addToGroup } = useChat();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(null); // ID of user being added
  const searchTimeoutRef = useRef(null);

  // Get existing member IDs
  const existingMemberIds = chat.users.map((u) => u._id);

  /**
   * Search for users
   */
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setSearching(true);
    try {
      const response = await userService.searchUsers(query);
      // Filter out users already in group
      const filteredUsers = (response.data?.users || []).filter(
        (user) => !existingMemberIds.includes(user._id)
      );
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Search failed:', err);
      showToast('error', 'Failed to search users');
    } finally {
      setSearching(false);
    }
  }, [existingMemberIds, showToast]);

  /**
   * Handle search input change
   */
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  /**
   * Add user to group
   */
  const handleAddUser = async (user) => {
    setAdding(user._id);
    try {
      await addToGroup(chat._id, user._id);
      showToast('success', `${user.name} added to group`);
      // Remove user from search results
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to add member');
    } finally {
      setAdding(null);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Add Members" size="md">
      <div className="add-member-modal">
        {/* Search Input */}
        <div className="search-section">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            autoFocus
          />
        </div>

        {/* Search Results */}
        <div className="search-results">
          {searching ? (
            <div className="search-loading">
              <div className="spinner" />
              <span>Searching...</span>
            </div>
          ) : users.length > 0 ? (
            <div className="user-results">
              {users.map((user) => (
                <div key={user._id} className="user-result-item">
                  <div className="user-result-avatar">
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt={user.name}
                      onError={(e) => { e.target.src = '/default-avatar.png'; }}
                    />
                  </div>
                  <div className="user-result-info">
                    <div className="user-result-name">{user.name}</div>
                    <div className="user-result-email">{user.email}</div>
                  </div>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleAddUser(user)}
                    disabled={adding === user._id}
                  >
                    {adding === user._id ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <div className="no-results">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <p>No users found</p>
              <span>Try a different search term</span>
            </div>
          ) : (
            <div className="search-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p>Search for users to add</p>
              <span>Type a name or email address</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddMemberModal;
