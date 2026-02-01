/**
 * MessageInput Component
 * Input area for composing and sending messages
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import './MessageInput.css';

/**
 * MessageInput component for sending messages
 * @param {Object} props - Component props
 * @param {Function} props.onSend - Send handler
 * @param {Function} props.onTyping - Typing handler
 * @param {boolean} props.disabled - Disabled state
 */
const MessageInput = ({ onSend, onTyping, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /**
   * Handle input change with typing indicator
   */
  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Emit typing event
    if (value && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping?.(false);
    }, 2000);
  };

  /**
   * Handle form submit
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Stop typing indicator
    setIsTyping(false);
    onTyping?.(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send message
    onSend(trimmedMessage);
    setMessage('');

    // Focus input after sending
    inputRef.current?.focus();
  };

  /**
   * Handle key press
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  /**
   * Focus input on mount
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <button 
        type="button"
        className="input-action-btn"
        title="Attach file (coming soon)"
        disabled
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      </button>

      <div className="message-input-wrapper">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="message-textarea"
          disabled={disabled}
          rows={1}
          maxLength={2000}
        />
      </div>

      <button 
        type="button"
        className="input-action-btn emoji-btn"
        title="Emoji (coming soon)"
        disabled
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </button>

      <button
        type="submit"
        className="send-btn"
        disabled={disabled || !message.trim()}
        title="Send message"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  );
};

export default MessageInput;
