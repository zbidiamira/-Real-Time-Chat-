/**
 * ProfileModal Component
 * Modal for editing user profile including avatar upload
 */

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { userService } from '../../services/user.service';
import { Button, Input, Modal } from '../common';
import './ProfileModal.css';

// API base URL for avatar display
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * ProfileModal component for viewing and editing user profile
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 */
const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setStatus(user.status || '');
      setAvatarPreview(null);
    }
  }, [user, isOpen]);

  /**
   * Get full avatar URL
   */
  const getAvatarUrl = (avatar) => {
    if (!avatar || avatar === 'default-avatar.png') {
      return '/default-avatar.png';
    }
    if (avatar.startsWith('http') || avatar.startsWith('blob:')) {
      return avatar;
    }
    return `${API_URL}${avatar}`;
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('error', 'Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview({
        file,
        preview: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle avatar upload
   */
  const handleAvatarUpload = async () => {
    if (!avatarPreview?.file) return;

    setUploading(true);
    try {
      const response = await userService.uploadAvatar(avatarPreview.file);
      updateUser(response.data.user);
      setAvatarPreview(null);
      showToast('success', 'Avatar updated successfully');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      showToast('error', err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle avatar removal
   */
  const handleRemoveAvatar = async () => {
    if (user.avatar === 'default-avatar.png') {
      showToast('info', 'You are already using the default avatar');
      return;
    }

    setUploading(true);
    try {
      const response = await userService.deleteAvatar();
      updateUser(response.data.user);
      showToast('success', 'Avatar removed successfully');
    } catch (err) {
      console.error('Avatar removal failed:', err);
      showToast('error', err.response?.data?.message || 'Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle profile save
   */
  const handleSave = async () => {
    // Validate
    if (name.trim().length < 2) {
      showToast('error', 'Name must be at least 2 characters');
      return;
    }

    setSaving(true);
    try {
      // Upload avatar if pending
      if (avatarPreview?.file) {
        await handleAvatarUpload();
      }

      // Update profile
      const response = await userService.updateProfile({
        name: name.trim(),
        status: status.trim()
      });
      
      updateUser(response.data.user);
      showToast('success', 'Profile updated successfully');
      onClose();
    } catch (err) {
      console.error('Profile update failed:', err);
      showToast('error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Cancel preview
   */
  const handleCancelPreview = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayAvatar = avatarPreview?.preview || getAvatarUrl(user?.avatar);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="profile-modal">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-container">
            <img
              src={displayAvatar}
              alt={user?.name || 'Profile'}
              className="profile-avatar-image"
              onError={(e) => { e.target.src = '/default-avatar.png'; }}
            />
            {uploading && (
              <div className="avatar-uploading-overlay">
                <div className="avatar-spinner" />
              </div>
            )}
          </div>
          
          <div className="profile-avatar-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden-file-input"
              id="avatar-upload"
            />
            
            {avatarPreview ? (
              <>
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleAvatarUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Save Photo'}
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleCancelPreview}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <label htmlFor="avatar-upload" className="avatar-upload-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Change Photo
                </label>
                {user?.avatar && user.avatar !== 'default-avatar.png' && (
                  <button
                    className="avatar-remove-btn"
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                  >
                    Remove
                  </button>
                )}
              </>
            )}
          </div>
          <p className="avatar-hint">JPG, PNG, GIF or WebP. Max 5MB.</p>
        </div>

        {/* Profile Form */}
        <div className="profile-form">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={50}
          />
          
          <div className="profile-input-group">
            <label className="profile-label">Email</label>
            <div className="profile-email">{user?.email}</div>
          </div>
          
          <Input
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={150}
          />
        </div>

        {/* Actions */}
        <div className="profile-modal-actions">
          <Button variant="ghost" onClick={onClose} disabled={saving || uploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || uploading || name.trim().length < 2}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
