/**
 * Avatar Component
 * User avatar with online indicator
 */

import './Avatar.css';

/**
 * Avatar component
 * @param {Object} props - Component props
 * @param {string} props.src - Image source
 * @param {string} props.alt - Alt text
 * @param {string} props.name - User name for fallback
 * @param {string} props.size - Avatar size (xs, sm, md, lg, xl)
 * @param {boolean} props.online - Show online indicator
 * @param {string} props.className - Additional CSS classes
 */
const Avatar = ({
  src,
  alt = 'User avatar',
  name = '',
  size = 'md',
  online,
  className = ''
}) => {
  /**
   * Get initials from name
   */
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  /**
   * Get background color from name
   */
  const getColorFromName = (name) => {
    if (!name) return '#6b7280';
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const isDefaultAvatar = !src || src === 'default-avatar.png';

  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {isDefaultAvatar ? (
        <div 
          className="avatar-initials"
          style={{ backgroundColor: getColorFromName(name) }}
        >
          {getInitials(name)}
        </div>
      ) : (
        <img src={src} alt={alt} className="avatar-image" />
      )}
      {typeof online === 'boolean' && (
        <span className={`avatar-status ${online ? 'online' : 'offline'}`} />
      )}
    </div>
  );
};

export default Avatar;
