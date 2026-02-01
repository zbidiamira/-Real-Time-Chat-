/**
 * ChatWindow Component
 * Main chat area displaying messages with real-time functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../hooks/useToast';
import { messageService } from '../../services/message.service';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import './ChatWindow.css';

/**
 * ChatWindow component displays the main chat area with messages
 */
const ChatWindow = () => {
  const { selectedChat, getChatName, getChatAvatar, updateChatLatestMessage, getChatPartner } = useChat();
  const { joinChat, leaveChat, sendMessage: emitMessage, emitTyping, emitStopTyping, on, off, isUserOnline } = useSocket();
  const { showToast } = useToast();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const currentChatRef = useRef(null);

  /**
   * Fetch messages for selected chat
   */
  const fetchMessages = useCallback(async (chatId, pageNum = 1, append = false) => {
    if (!chatId) return;
    
    setLoading(true);
    try {
      const response = await messageService.getMessages(chatId, pageNum);
      const newMessages = response.data?.messages || [];
      
      if (append) {
        setMessages((prev) => [...newMessages.reverse(), ...prev]);
      } else {
        setMessages(newMessages.reverse());
      }
      
      setHasMore(newMessages.length === 50);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      showToast('error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Load more messages (pagination)
   */
  const handleLoadMore = useCallback(() => {
    if (selectedChat && hasMore && !loading) {
      fetchMessages(selectedChat._id, page + 1, true);
    }
  }, [selectedChat, hasMore, loading, page, fetchMessages]);

  /**
   * Handle chat selection changes
   */
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      setTypingUsers([]);
      return;
    }

    // Leave previous chat room
    if (currentChatRef.current && currentChatRef.current !== selectedChat._id) {
      leaveChat(currentChatRef.current);
    }

    // Join new chat room
    currentChatRef.current = selectedChat._id;
    joinChat(selectedChat._id);
    
    // Reset and fetch messages
    setMessages([]);
    setPage(1);
    setHasMore(true);
    setTypingUsers([]);
    fetchMessages(selectedChat._id, 1);
  }, [selectedChat?._id, joinChat, leaveChat, fetchMessages]);

  /**
   * Handle socket events for messages
   */
  useEffect(() => {
    if (!selectedChat) return;

    // New message received
    const handleNewMessage = (message) => {
      // Only add if message is for current chat
      const chatId = message.chat?._id || message.chat;
      if (chatId === selectedChat._id) {
        setMessages((prev) => [...prev, message]);
      }
      // Update latest message in chat list
      updateChatLatestMessage(message);
    };

    // Typing events
    const handleTyping = ({ chatId, userId, userName }) => {
      if (chatId === selectedChat._id) {
        setTypingUsers((prev) => {
          if (!prev.includes(userName)) {
            return [...prev, userName];
          }
          return prev;
        });
      }
    };

    const handleStopTyping = ({ chatId, userId }) => {
      if (chatId === selectedChat._id) {
        setTypingUsers((prev) => prev.filter((name) => name !== userId));
      }
    };

    // Subscribe to events
    on('message_received', handleNewMessage);
    on('typing', handleTyping);
    on('stop_typing', handleStopTyping);

    // Cleanup
    return () => {
      off('message_received', handleNewMessage);
      off('typing', handleTyping);
      off('stop_typing', handleStopTyping);
    };
  }, [selectedChat?._id, on, off, updateChatLatestMessage]);

  /**
   * Send a message
   */
  const handleSend = async (content) => {
    if (!selectedChat || !content.trim() || sending) return;

    setSending(true);
    try {
      const response = await messageService.sendMessage({
        chatId: selectedChat._id,
        content: content.trim()
      });

      const newMessage = response.data?.message;
      if (newMessage) {
        // Add to local messages
        setMessages((prev) => [...prev, newMessage]);
        
        // Emit via socket for real-time
        emitMessage(newMessage);
        
        // Update chat list
        updateChatLatestMessage(newMessage);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      showToast('error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  /**
   * Handle typing indicator
   */
  const handleTyping = (isTyping) => {
    if (!selectedChat) return;
    
    if (isTyping) {
      emitTyping(selectedChat._id);
    } else {
      emitStopTyping(selectedChat._id);
    }
  };

  // Empty state when no chat selected
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
  const partner = getChatPartner(selectedChat);
  const isOnline = !selectedChat.isGroupChat && partner && isUserOnline(partner._id);

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
            {isOnline && <span className="online-badge" />}
          </div>
          <div className="chat-header-details">
            <h3 className="chat-header-name">{chatName}</h3>
            <span className={`chat-header-status ${isOnline ? 'status-online' : ''}`}>
              {selectedChat.isGroupChat 
                ? `${selectedChat.users.length} members`
                : isOnline ? 'Online' : 'Offline'
              }
            </span>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="header-action-btn" title="Video call (coming soon)" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>
          <button className="header-action-btn" title="Voice call (coming soon)" disabled>
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

      {/* Messages Area */}
      <MessageList
        messages={messages}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />

      {/* Typing Indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Message Input */}
      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={sending}
      />
    </div>
  );
};

export default ChatWindow;
