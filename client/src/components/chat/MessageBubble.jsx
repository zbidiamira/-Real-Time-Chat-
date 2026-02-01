/**
 * MessageBubble Component
 * Individual message bubble with sender info
 */

import Avatar from '../common/Avatar';
import { formatTime } from '../../utils/dateUtils';
import './MessageBubble.css';

/**
 * MessageBubble component renders a single message
 * @param {Object} props - Component props
 * @param {Object} props.message - Message data
 * @param {boolean} props.isOwn - Is this user's own message
 * @param {boolean} props.showSender - Show sender name (for groups)
 */
const MessageBubble = ({ message, isOwn, showSender = false }) => {
  const { content, sender, createdAt, type = 'text' } = message;

  return (
    <div className={`message-bubble-wrapper ${isOwn ? 'message-own' : 'message-other'}`}>
      {/* Avatar for other's messages */}
      {!isOwn && (
        <Avatar 
          src={sender?.avatar} 
          name={sender?.name} 
          size="sm"
          className="message-avatar"
        />
      )}

      <div className="message-content-wrapper">
        {/* Sender name for group chats */}
        {!isOwn && showSender && (
          <span className="message-sender">{sender?.name}</span>
        )}

        {/* Message bubble */}
        <div className={`message-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
          {type === 'text' && (
            <p className="message-text">{content}</p>
          )}
          
          {type === 'image' && message.attachments?.[0] && (
            <img 
              src={message.attachments[0].url} 
              alt="Shared image"
              className="message-image"
            />
          )}

          {type === 'file' && message.attachments?.[0] && (
            <a 
              href={message.attachments[0].url}
              download={message.attachments[0].name}
              className="message-file"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>{message.attachments[0].name}</span>
            </a>
          )}

          <span className="message-time">{formatTime(createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
