/**
 * GroupInfoDrawer Component
 * Side drawer showing group chat details and member management
 */

import { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import MemberList from './MemberList';
import AddMemberModal from './AddMemberModal';
import Button from '../common/Button';
import Input from '../common/Input';
import './GroupInfoDrawer.css';

// API base URL for avatar display
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get full avatar URL
 */
const getAvatarUrl = (avatar) => {
  if (!avatar || avatar === 'default-avatar.png' || avatar === 'default-group.png') {
    return avatar === 'default-group.png' ? '/default-group.png' : '/default-avatar.png';
  }
  if (avatar.startsWith('http') || avatar.startsWith('/default')) {
    return avatar;
  }
  return `${API_URL}${avatar}`;
};

/**
 * GroupInfoDrawer component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether drawer is open
 * @param {Function} props.onClose - Close handler
 */
const GroupInfoDrawer = ({ isOpen, onClose }) => {
  const { selectedChat, renameGroup, removeFromGroup } = useChat();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !selectedChat || !selectedChat.isGroupChat) {
    return null;
  }

  const isAdmin = selectedChat.groupAdmin?._id === user?._id || 
                  selectedChat.groupAdmin === user?._id;

  /**
   * Start editing group name
   */
  const handleStartEdit = () => {
    setNewName(selectedChat.chatName);
    setIsEditing(true);
  };

  /**
   * Save group name
   */
  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim() === selectedChat.chatName) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await renameGroup(selectedChat._id, newName.trim());
      showToast('success', 'Group name updated');
      setIsEditing(false);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to rename group');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel editing
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewName('');
  };

  /**
   * Handle member removal
   */
  const handleRemoveMember = async (memberId) => {
    setLoading(true);
    try {
      await removeFromGroup(selectedChat._id, memberId);
      const isLeaving = memberId === user?._id;
      showToast('success', isLeaving ? 'You left the group' : 'Member removed');
      if (isLeaving) {
        onClose();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle leave group
   */
  const handleLeaveGroup = () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      handleRemoveMember(user._id);
    }
  };

  return (
    <>
      <div className={`group-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`group-drawer ${isOpen ? 'open' : ''}`}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <h2>Group Info</h2>
          <button className="drawer-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Group Avatar & Name */}
        <div className="drawer-group-info">
          <div className="group-avatar-large">
            <img
              src={getAvatarUrl(selectedChat.groupAvatar)}
              alt={selectedChat.chatName}
              onError={(e) => { e.target.src = '/default-group.png'; }}
            />
          </div>
          
          {isEditing ? (
            <div className="group-name-edit">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Group name"
                maxLength={50}
                autoFocus
              />
              <div className="edit-actions">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleSaveName}
                  disabled={loading || !newName.trim()}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="group-name-display">
              <h3>{selectedChat.chatName}</h3>
              {isAdmin && (
                <button className="edit-name-btn" onClick={handleStartEdit} title="Edit name">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          <p className="group-member-count">
            {selectedChat.users.length} members
          </p>
        </div>

        {/* Members Section */}
        <div className="drawer-section">
          <div className="section-header">
            <h4>Members</h4>
            {isAdmin && (
              <Button
                variant="ghost"
                size="small"
                onClick={() => setIsAddMemberOpen(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Add
              </Button>
            )}
          </div>
          
          <MemberList
            members={selectedChat.users}
            adminId={selectedChat.groupAdmin?._id || selectedChat.groupAdmin}
            currentUserId={user?._id}
            isAdmin={isAdmin}
            onRemove={handleRemoveMember}
            loading={loading}
          />
        </div>

        {/* Actions */}
        <div className="drawer-actions">
          <Button
            variant="danger"
            onClick={handleLeaveGroup}
            disabled={loading}
            fullWidth
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Leave Group
          </Button>
        </div>
      </aside>

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <AddMemberModal
          chat={selectedChat}
          onClose={() => setIsAddMemberOpen(false)}
        />
      )}
    </>
  );
};

export default GroupInfoDrawer;
