/**
 * @fileoverview Skeleton Loading Component
 * @description Reusable skeleton loader with shimmer animation
 */

import './Skeleton.css';

/**
 * Skeleton component for loading placeholders
 * @param {Object} props - Component props
 * @param {string} [props.variant='text'] - Type: text, circular, rectangular
 * @param {string|number} [props.width] - Width of skeleton
 * @param {string|number} [props.height] - Height of skeleton
 * @param {number} [props.count=1] - Number of skeleton elements
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.animation=true] - Enable shimmer animation
 */
const Skeleton = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  animation = true
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  const baseClass = `skeleton skeleton-${variant} ${animation ? 'skeleton-animated' : ''} ${className}`;

  if (count === 1) {
    return <div className={baseClass} style={style} />;
  }

  return (
    <div className="skeleton-group">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={baseClass} style={style} />
      ))}
    </div>
  );
};

/**
 * ChatItemSkeleton - Loading placeholder for chat list items
 */
export const ChatItemSkeleton = () => (
  <div className="skeleton-chat-item">
    <Skeleton variant="circular" width={48} height={48} />
    <div className="skeleton-chat-content">
      <Skeleton variant="text" width="60%" height={16} />
      <Skeleton variant="text" width="80%" height={12} />
    </div>
    <Skeleton variant="text" width={40} height={10} />
  </div>
);

/**
 * MessageSkeleton - Loading placeholder for messages
 */
export const MessageSkeleton = ({ isOwn = false }) => (
  <div className={`skeleton-message ${isOwn ? 'skeleton-message-own' : ''}`}>
    {!isOwn && <Skeleton variant="circular" width={32} height={32} />}
    <div className="skeleton-message-bubble">
      <Skeleton variant="text" width={isOwn ? 150 : 180} height={14} />
      <Skeleton variant="text" width={isOwn ? 100 : 140} height={14} />
    </div>
  </div>
);

/**
 * ChatListSkeleton - Loading placeholder for chat list
 */
export const ChatListSkeleton = ({ count = 5 }) => (
  <div className="skeleton-chat-list">
    {Array.from({ length: count }).map((_, index) => (
      <ChatItemSkeleton key={index} />
    ))}
  </div>
);

/**
 * MessageListSkeleton - Loading placeholder for message list
 */
export const MessageListSkeleton = ({ count = 10 }) => (
  <div className="skeleton-message-list">
    {Array.from({ length: count }).map((_, index) => (
      <MessageSkeleton key={index} isOwn={index % 3 === 0} />
    ))}
  </div>
);

/**
 * UserSearchSkeleton - Loading placeholder for search results
 */
export const UserSearchSkeleton = ({ count = 4 }) => (
  <div className="skeleton-user-list">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="skeleton-user-item">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="skeleton-user-content">
          <Skeleton variant="text" width="70%" height={14} />
          <Skeleton variant="text" width="50%" height={12} />
        </div>
      </div>
    ))}
  </div>
);

/**
 * ProfileSkeleton - Loading placeholder for profile
 */
export const ProfileSkeleton = () => (
  <div className="skeleton-profile">
    <Skeleton variant="circular" width={100} height={100} />
    <Skeleton variant="text" width={150} height={20} />
    <Skeleton variant="text" width={200} height={14} />
    <Skeleton variant="rectangular" width="100%" height={80} />
  </div>
);

export default Skeleton;
