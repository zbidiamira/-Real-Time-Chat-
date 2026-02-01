/**
 * MemberList Component
 * Displays list of group members with admin actions
 */

import MemberItem from './MemberItem';
import './MemberList.css';

/**
 * MemberList component
 * @param {Object} props - Component props
 * @param {Array} props.members - Array of member objects
 * @param {string} props.adminId - ID of group admin
 * @param {string} props.currentUserId - Current user's ID
 * @param {boolean} props.isAdmin - Whether current user is admin
 * @param {Function} props.onRemove - Handler for removing member
 * @param {boolean} props.loading - Loading state
 */
const MemberList = ({
  members = [],
  adminId,
  currentUserId,
  isAdmin,
  onRemove,
  loading
}) => {
  if (!members.length) {
    return (
      <div className="member-list-empty">
        <p>No members in this group</p>
      </div>
    );
  }

  // Sort members: admin first, then alphabetically
  const sortedMembers = [...members].sort((a, b) => {
    const aIsAdmin = (a._id === adminId);
    const bIsAdmin = (b._id === adminId);
    
    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div className="member-list">
      {sortedMembers.map((member) => (
        <MemberItem
          key={member._id}
          member={member}
          isAdmin={member._id === adminId}
          isCurrentUser={member._id === currentUserId}
          canRemove={isAdmin && member._id !== adminId}
          canLeave={member._id === currentUserId}
          onRemove={() => onRemove(member._id)}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default MemberList;
