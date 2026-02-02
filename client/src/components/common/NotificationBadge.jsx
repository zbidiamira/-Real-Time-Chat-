/**
 * NotificationBadge Component
 * Displays a badge with unread count
 */

import './NotificationBadge.css';

/**
 * NotificationBadge component
 * @param {Object} props - Component props
 * @param {number} props.count - Unread count to display
 * @param {string} props.size - Badge size: 'small', 'medium', 'large'
 * @param {string} props.position - Position: 'top-right', 'top-left', 'inline'
 * @param {number} props.max - Maximum number to display before showing "+"
 * @param {string} props.className - Additional CSS classes
 */
const NotificationBadge = ({ 
  count = 0, 
  size = 'medium',
  position = 'top-right',
  max = 99,
  className = ''
}) => {
  if (count <= 0) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count;
  
  return (
    <span 
      className={`notification-badge badge-${size} badge-${position} ${className}`}
      aria-label={`${count} unread messages`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;
