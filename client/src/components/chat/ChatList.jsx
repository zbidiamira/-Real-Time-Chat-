/**
 * ChatList Component
 * Displays list of user's chats
 */

import { useMemo } from 'react';
import ChatItem from './ChatItem';
import { useChat } from '../../hooks/useChat';
import './ChatList.css';

/**
 * ChatList component renders filtered list of chats
 * @param {Object} props - Component props
 * @param {string} props.searchQuery - Search filter
 * @param {Function} props.onChatSelect - Callback when chat is selected (for mobile)
 */
const ChatList = ({ searchQuery = '', onChatSelect }) => {
  const { chats, selectedChat, selectChat, getChatName } = useChat();

  /**
   * Handle chat selection
   */
  const handleChatClick = (chat) => {
    selectChat(chat);
    // Notify parent (for mobile drawer close)
    if (onChatSelect) {
      onChatSelect(chat);
    }
  };

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    const query = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      const chatName = getChatName(chat).toLowerCase();
      return chatName.includes(query);
    });
  }, [chats, searchQuery, getChatName]);

  if (filteredChats.length === 0) {
    return (
      <div className="chat-list-empty">
        {searchQuery ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <p>No chats found for "{searchQuery}"</p>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>No conversations yet</p>
            <span>Start a new chat to begin messaging</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="chat-list">
      {filteredChats.map((chat) => (
        <ChatItem
          key={chat._id}
          chat={chat}
          isSelected={selectedChat?._id === chat._id}
          onClick={() => handleChatClick(chat)}
        />
      ))}
    </div>
  );
};

export default ChatList;
