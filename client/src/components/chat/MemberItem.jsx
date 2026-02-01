/**
 * MemberItem Component
 * Individual member row with actions
 */

import './MemberItem.css';

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
 * MemberItem component
 * @param {Object} props - Component props
 * @param {Object} props.member - Member object
 * @param {boolean} props.isAdmin - Whether member is group admin
 * @param {boolean} props.isCurrentUser - Whether member is current user
 * @param {boolean} props.canRemove - Whether current user can remove this member
 * @param {boolean} props.canLeave - Whether this is current user who can leave
 * @param {Function} props.onRemove - Remove handler
 * @param {boolean} props.loading - Loading state
 */
const MemberItem = ({
  member,
  isAdmin,
  isCurrentUser,
  canRemove,
  canLeave,
  onRemove,
  loading
}) => {
  return (
    <div className={`member-item ${isCurrentUser ? 'is-you' : ''}`}>
      <div className="member-avatar">
        <img
          src={getAvatarUrl(member.avatar)}
          alt={member.name}
          onError={(e) => { e.target.src = '/default-avatar.png'; }}
        />
        {member.isOnline && <span className="online-dot" />}
      </div>
      
      <div className="member-info">
        <div className="member-name">
          {member.name}
          {isCurrentUser && <span className="you-badge">(You)</span>}
          {isAdmin && <span className="admin-badge">Admin</span>}
        </div>
        <div className="member-email">{member.email}</div>
      </div>

      <div className="member-actions">
        {canRemove && (
          <button
            className="member-action-btn remove-btn"
            onClick={onRemove}
            disabled={loading}
            title="Remove from group"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default MemberItem;
