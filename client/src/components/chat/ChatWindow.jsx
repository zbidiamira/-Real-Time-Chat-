/**
 * ChatWindow Component
 * Main chat area displaying messages placeholder
 */

import { useChat } from '../../hooks/useChat';
import './ChatWindow.css';

/**
 * ChatWindow component displays the main chat area
 */
const ChatWindow = () => {
  const { selectedChat, getChatName, getChatAvatar } = useChat();

  if (!selectedChat) {
    return (
      <div className="chat-window chat-window-empty">
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2>Welcome to Chat App</h2>
          <p>Select a conversation or start a new chat to begin messaging</p>
        </div>
      </div>
    );
  }

  const chatName = getChatName(selectedChat);
  const chatAvatar = getChatAvatar(selectedChat);

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-header-avatar">
            <img 
              src={chatAvatar} 
              alt={chatName}
              onError={(e) => { 
                e.target.src = selectedChat.isGroupChat ? '/default-group.png' : '/default-avatar.png'; 
              }}
            />
          </div>
          <div className="chat-header-details">
            <h3 className="chat-header-name">{chatName}</h3>
            <span className="chat-header-status">
              {selectedChat.isGroupChat 
                ? `${selectedChat.users.length} members`
                : 'Online'
              }
            </span>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="header-action-btn" title="Video call">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>
          <button className="header-action-btn" title="Voice call">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
          <button className="header-action-btn" title="More options">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area - Placeholder for PR #11 */}
      <div className="chat-messages">
        <div className="messages-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>Messages will appear here</p>
          <span>Real-time messaging coming in PR #11</span>
        </div>
      </div>

      {/* Message Input - Placeholder for PR #11 */}
      <div className="chat-input-area">
        <button className="input-action-btn" title="Attach file">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <div className="message-input-wrapper">
          <input 
            type="text" 
            placeholder="Type a message..."
            className="message-input"
            disabled
          />
        </div>
        <button className="send-btn" disabled title="Send message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
