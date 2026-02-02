/**
 * ChatItem Component
 * Individual chat item in the chat list
 */

import { useChat } from '../../hooks/useChat';
import { useNotification } from '../../hooks/useNotification';
import { formatRelativeTime } from '../../utils/dateUtils';
import { NotificationBadge } from '../common';
import './ChatItem.css';

/**
 * ChatItem component displays a single chat preview
 * @param {Object} props - Component props
 * @param {Object} props.chat - Chat data
 * @param {boolean} props.isSelected - Whether this chat is selected
 * @param {Function} props.onClick - Click handler
 */
const ChatItem = ({ chat, isSelected, onClick }) => {
  const { getChatName, getChatAvatar, getChatPartner } = useChat();
  const { getUnreadCount } = useNotification();

  const chatName = getChatName(chat);
  const chatAvatar = getChatAvatar(chat);
  const partner = getChatPartner(chat);
  const isOnline = !chat.isGroupChat && partner?.isOnline;
  const unreadCount = getUnreadCount(chat._id);

  // Get latest message preview
  const getMessagePreview = () => {
    if (!chat.latestMessage) return 'No messages yet';

    const { content, sender } = chat.latestMessage;
    const senderName = sender?.name || 'Unknown';

    if (chat.isGroupChat) {
      return `${senderName}: ${content}`;
    }
    return content;
  };

  // Get message timestamp
  const getTimestamp = () => {
    if (!chat.latestMessage?.createdAt) return '';
    return formatRelativeTime(chat.latestMessage.createdAt);
  };

  return (
    <div 
      className={`chat-item ${isSelected ? 'chat-item-selected' : ''} ${unreadCount > 0 ? 'chat-item-unread' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="chat-item-avatar">
        <img 
          src={chatAvatar} 
          alt={chatName}
          onError={(e) => { 
            e.target.src = chat.isGroupChat ? '/default-group.svg' : '/default-avatar.svg'; 
          }}
        />
        {isOnline && <span className="online-dot" />}
        {chat.isGroupChat && (
          <span className="group-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-6 8v-2c0-2.21 1.79-4 4-4h4c2.21 0 4 1.79 4 4v2H6z" />
            </svg>
          </span>
        )}
      </div>

      <div className="chat-item-content">
        <div className="chat-item-header">
          <h4 className="chat-item-name">{chatName}</h4>
          <span className={`chat-item-time ${unreadCount > 0 ? 'time-unread' : ''}`}>
            {getTimestamp()}
          </span>
        </div>
        <div className="chat-item-footer">
          <p className={`chat-item-preview ${unreadCount > 0 ? 'preview-unread' : ''}`}>
            {getMessagePreview()}
          </p>
          {unreadCount > 0 && (
            <NotificationBadge count={unreadCount} size="small" position="inline" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
