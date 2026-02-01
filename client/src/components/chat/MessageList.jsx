/**
 * MessageList Component
 * Scrollable list of messages with auto-scroll
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import { useAuth } from '../../hooks/useAuth';
import { formatMessageDate, isSameDay } from '../../utils/dateUtils';
import './MessageList.css';

/**
 * MessageList component renders messages with date separators
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of messages
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.hasMore - Has more messages to load
 * @param {Function} props.onLoadMore - Load more handler
 */
const MessageList = ({ messages, loading, hasMore, onLoadMore }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  /**
   * Handle scroll events
   */
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Show scroll button if not at bottom
    setShowScrollBtn(distanceFromBottom > 100);
    setIsAtBottom(distanceFromBottom < 50);

    // Load more when scrolling to top
    if (scrollTop < 50 && hasMore && !loading) {
      onLoadMore?.();
    }
  }, [hasMore, loading, onLoadMore]);

  /**
   * Auto-scroll when new messages arrive (if at bottom)
   */
  useEffect(() => {
    if (isAtBottom && messages.length > 0) {
      scrollToBottom('auto');
    }
  }, [messages.length, isAtBottom, scrollToBottom]);

  /**
   * Initial scroll to bottom
   */
  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  /**
   * Group messages by date
   */
  const groupedMessages = messages.reduce((groups, message, index) => {
    const prevMessage = messages[index - 1];
    const showDateSeparator = !prevMessage || !isSameDay(message.createdAt, prevMessage.createdAt);
    
    if (showDateSeparator) {
      groups.push({
        type: 'date',
        date: message.createdAt,
        key: `date-${message.createdAt}`
      });
    }
    
    groups.push({
      type: 'message',
      message,
      key: message._id
    });
    
    return groups;
  }, []);

  return (
    <div 
      ref={containerRef}
      className="message-list"
      onScroll={handleScroll}
    >
      {/* Loading indicator at top */}
      {loading && hasMore && (
        <div className="messages-loading-top">
          <div className="loading-spinner-small" />
          <span>Loading messages...</span>
        </div>
      )}

      {/* Messages */}
      {groupedMessages.map((item) => {
        if (item.type === 'date') {
          return (
            <div key={item.key} className="message-date-separator">
              <span>{formatMessageDate(item.date)}</span>
            </div>
          );
        }
        
        return (
          <MessageBubble
            key={item.key}
            message={item.message}
            isOwn={item.message.sender?._id === user?._id}
          />
        );
      })}

      {/* Empty state */}
      {!loading && messages.length === 0 && (
        <div className="messages-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>No messages yet</p>
          <span>Send a message to start the conversation</span>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button 
          className="scroll-to-bottom-btn"
          onClick={() => scrollToBottom()}
          aria-label="Scroll to bottom"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessageList;
