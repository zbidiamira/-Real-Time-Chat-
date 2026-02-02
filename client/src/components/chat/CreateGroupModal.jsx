/**
 * CreateGroupModal Component
 * Modal for creating a new group chat
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { userService } from '../../services/user.service';
import { useChat } from '../../hooks/useChat';
import { useToast } from '../../hooks/useToast';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Input from '../common/Input';
import './CreateGroupModal.css';

/**
 * CreateGroupModal component for group chat creation
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Close handler
 */
const CreateGroupModal = ({ onClose }) => {
  const { createGroupChat } = useChat();
  const { showToast } = useToast();
  const [step, setStep] = useState(1); // 1: Name, 2: Add Members
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const nameInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Focus appropriate input based on step
  useEffect(() => {
    if (step === 1) {
      nameInputRef.current?.focus();
    } else {
      searchInputRef.current?.focus();
    }
  }, [step]);

  // Debounced search
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setSearching(true);
    try {
      const response = await userService.searchUsers(query);
      // Filter out already selected users
      const filteredUsers = (response.data?.users || []).filter(
        (user) => !selectedUsers.find((u) => u._id === user._id)
      );
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Search failed:', err);
      showToast('error', 'Failed to search users');
    } finally {
      setSearching(false);
    }
  }, [selectedUsers, showToast]);

  // Handle search input change
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

  // Add user to selected list
  const handleSelectUser = (user) => {
    setSelectedUsers((prev) => [...prev, user]);
    setUsers((prev) => prev.filter((u) => u._id !== user._id));
    setSearchQuery('');
  };

  // Remove user from selected list
  const handleRemoveUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  // Go to next step
  const handleNext = () => {
    if (!groupName.trim()) {
      showToast('error', 'Please enter a group name');
      return;
    }
    setStep(2);
  };

  // Create the group
  const handleCreateGroup = async () => {
    if (selectedUsers.length < 2) {
      showToast('error', 'Please select at least 2 members');
      return;
    }

    setLoading(true);
    try {
      await createGroupChat({
        name: groupName.trim(),
        users: selectedUsers.map((u) => u._id)
      });
      showToast('success', `Group "${groupName}" created`);
      onClose();
    } catch (err) {
      showToast('error', 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-group-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>{step === 1 ? 'New Group' : 'Add Members'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {step === 1 ? (
            /* Step 1: Group Name */
            <div className="group-name-step">
              <div className="group-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="step-description">
                Enter a name for your group chat
              </p>
              <Input
                ref={nameInputRef}
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={50}
              />
              <span className="char-count">{groupName.length}/50</span>
            </div>
          ) : (
            /* Step 2: Add Members */
            <div className="add-members-step">
              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="selected-users">
                  {selectedUsers.map((user) => (
                    <div key={user._id} className="selected-user-chip">
                      <Avatar src={user.avatar} name={user.name} size="sm" />
                      <span>{user.name}</span>
                      <button 
                        className="remove-user-btn"
                        onClick={() => handleRemoveUser(user._id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Input */}
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search users to add..."
                value={searchQuery}
                onChange={handleSearchChange}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                }
              />

              {/* Search Results */}
              <div className="member-search-results">
                {searching && (
                  <div className="search-loading">
                    <div className="spinner" />
                    <span>Searching...</span>
                  </div>
                )}

                {!searching && searchQuery && users.length === 0 && (
                  <div className="search-empty">
                    <p>No users found</p>
                  </div>
                )}

                {!searching && users.length > 0 && (
                  <ul className="user-list">
                    {users.map((user) => (
                      <li key={user._id}>
                        <button
                          className="user-item"
                          onClick={() => handleSelectUser(user)}
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
                          <svg className="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v8M8 12h8" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <p className="member-count">
                {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
                {selectedUsers.length < 2 && (
                  <span className="min-warning"> (minimum 2 required)</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {step === 1 ? (
            <>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleNext} disabled={!groupName.trim()}>
                Next
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={handleCreateGroup} 
                loading={loading}
                disabled={selectedUsers.length < 2}
              >
                Create Group
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
