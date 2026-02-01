/**
 * TypingIndicator Component
 * Shows when other users are typing
 */

import './TypingIndicator.css';

/**
 * TypingIndicator component displays typing animation
 * @param {Object} props - Component props
 * @param {Array} props.typingUsers - Array of typing user names
 */
const TypingIndicator = ({ typingUsers = [] }) => {
  if (typingUsers.length === 0) return null;

  const getText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing`;
    }
    if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing`;
    }
    return `${typingUsers.length} people are typing`;
  };

  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
      <span className="typing-text">{getText()}</span>
    </div>
  );
};

export default TypingIndicator;
