/**
 * MessageBubble Component
 * Individual message bubble with sender info and media support
 */

import Avatar from '../common/Avatar';
import MediaMessage from './MediaMessage';
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
  const { content, sender, createdAt, attachments } = message;
  
  // Check if message has attachments
  const hasAttachments = attachments && attachments.length > 0;
  
  // Show text content unless it's only "Shared media" placeholder with attachments
  const hasTextContent = content && !(content === 'Shared media' && hasAttachments);

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
        <div className={`message-bubble ${isOwn ? 'bubble-own' : 'bubble-other'} ${hasAttachments ? 'has-attachments' : ''}`}>
          {/* Media attachments */}
          {hasAttachments && (
            <MediaMessage 
              attachments={attachments} 
              isSent={isOwn}
            />
          )}
          
          {/* Text content */}
          {hasTextContent && (
            <p className="message-text">{content}</p>
          )}

          <span className="message-time">{formatTime(createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
