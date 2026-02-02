/**
 * Chat Context
 * Manages chat state and operations throughout the app
 */

import { createContext, useState, useCallback, useEffect } from 'react';
import { chatService } from '../services/chat.service';
import { useAuth } from '../hooks/useAuth';

// Create chat context
export const ChatContext = createContext(null);

/**
 * Chat Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all chats for the current user
   */
  const fetchChats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.getChats();
      setChats(response.data.chats || []);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
      setError(err.response?.data?.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Load chats when user is authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      fetchChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [isAuthenticated, fetchChats]);

  /**
   * Select a chat
   * @param {Object} chat - Chat to select
   */
  const selectChat = useCallback((chat) => {
    setSelectedChat(chat);
  }, []);

  /**
   * Create or access a private chat
   * @param {string} userId - User ID to chat with
   * @returns {Promise<Object>} Created/existing chat
   */
  const accessChat = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.accessChat(userId);
      const chat = response.data.chat;

      // Check if chat already exists in list
      const chatExists = chats.find((c) => c._id === chat._id);
      if (!chatExists) {
        setChats((prev) => [chat, ...prev]);
      }

      setSelectedChat(chat);
      return chat;
    } catch (err) {
      console.error('Failed to access chat:', err);
      setError(err.response?.data?.message || 'Failed to create chat');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [chats]);

  /**
   * Create a group chat
   * @param {Object} groupData - { name, users }
   * @returns {Promise<Object>} Created group chat
   */
  const createGroupChat = useCallback(async (groupData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.createGroup(groupData);
      const chat = response.data.chat;

      setChats((prev) => [chat, ...prev]);
      setSelectedChat(chat);
      return chat;
    } catch (err) {
      console.error('Failed to create group:', err);
      setError(err.response?.data?.message || 'Failed to create group');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Rename a group chat
   * @param {string} chatId - Chat ID
   * @param {string} name - New name
   * @returns {Promise<Object>} Updated chat
   */
  const renameGroup = useCallback(async (chatId, name) => {
    try {
      const response = await chatService.renameGroup(chatId, name);
      const updatedChat = response.data.chat;

      setChats((prev) =>
        prev.map((chat) => (chat._id === chatId ? updatedChat : chat))
      );

      if (selectedChat?._id === chatId) {
        setSelectedChat(updatedChat);
      }

      return updatedChat;
    } catch (err) {
      console.error('Failed to rename group:', err);
      throw err;
    }
  }, [selectedChat]);

  /**
   * Add user to group
   * @param {string} chatId - Chat ID
   * @param {string} userId - User ID to add
   * @returns {Promise<Object>} Updated chat
   */
  const addToGroup = useCallback(async (chatId, userId) => {
    try {
      const response = await chatService.addToGroup(chatId, userId);
      const updatedChat = response.data.chat;

      setChats((prev) =>
        prev.map((chat) => (chat._id === chatId ? updatedChat : chat))
      );

      if (selectedChat?._id === chatId) {
        setSelectedChat(updatedChat);
      }

      return updatedChat;
    } catch (err) {
      console.error('Failed to add to group:', err);
      throw err;
    }
  }, [selectedChat]);

  /**
   * Remove user from group
   * @param {string} chatId - Chat ID
   * @param {string} userId - User ID to remove
   * @returns {Promise<Object>} Updated chat
   */
  const removeFromGroup = useCallback(async (chatId, userId) => {
    try {
      const response = await chatService.removeFromGroup(chatId, userId);
      const updatedChat = response.data.chat;

      // If user removed themselves, remove chat from list
      if (userId === user?._id) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        if (selectedChat?._id === chatId) {
          setSelectedChat(null);
        }
      } else {
        setChats((prev) =>
          prev.map((chat) => (chat._id === chatId ? updatedChat : chat))
        );
        if (selectedChat?._id === chatId) {
          setSelectedChat(updatedChat);
        }
      }

      return updatedChat;
    } catch (err) {
      console.error('Failed to remove from group:', err);
      throw err;
    }
  }, [selectedChat, user]);

  /**
   * Add a new chat to the list (for when receiving message from new chat)
   * @param {Object} chat - New chat object
   */
  const addNewChat = useCallback((chat) => {
    setChats((prev) => {
      // Check if chat already exists
      const exists = prev.some((c) => c._id === chat._id);
      if (exists) return prev;
      // Add new chat at the beginning
      return [chat, ...prev];
    });
  }, []);

  /**
   * Update chat with latest message
   * @param {Object} message - New message
   * @param {boolean} shouldRefetch - Whether to refetch chats if chat not found
   */
  const updateChatLatestMessage = useCallback((message, shouldRefetch = true) => {
    const chatId = message.chat?._id || message.chat;
    
    setChats((prev) => {
      const chatIndex = prev.findIndex((c) => c._id === chatId);
      
      if (chatIndex === -1) {
        // Chat not found in list - this is a new chat
        // We'll refetch chats to get the new one
        if (shouldRefetch) {
          // Use setTimeout to avoid state update during render
          setTimeout(() => {
            fetchChats();
          }, 100);
        }
        return prev;
      }

      const updatedChats = [...prev];
      const [chat] = updatedChats.splice(chatIndex, 1);
      chat.latestMessage = message;
      return [chat, ...updatedChats];
    });
  }, [fetchChats]);

  /**
   * Get the other user in a private chat
   * @param {Object} chat - Chat object
   * @returns {Object|null} Other user
   */
  const getChatPartner = useCallback((chat) => {
    if (!chat || !user || chat.isGroupChat) return null;
    return chat.users.find((u) => u._id !== user._id);
  }, [user]);

  /**
   * Get display name for a chat
   * @param {Object} chat - Chat object
   * @returns {string} Display name
   */
  const getChatName = useCallback((chat) => {
    if (!chat) return '';
    if (chat.isGroupChat) return chat.chatName;
    const partner = getChatPartner(chat);
    return partner?.name || 'Unknown User';
  }, [getChatPartner]);

  /**
   * Get avatar for a chat
   * @param {Object} chat - Chat object
   * @returns {string} Avatar URL
   */
  const getChatAvatar = useCallback((chat) => {
    if (!chat) return '/default-avatar.svg';
    if (chat.isGroupChat) return chat.groupAvatar || '/default-group.svg';
    const partner = getChatPartner(chat);
    return partner?.avatar || '/default-avatar.svg';
  }, [getChatPartner]);

  const value = {
    chats,
    selectedChat,
    loading,
    error,
    fetchChats,
    selectChat,
    accessChat,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    updateChatLatestMessage,
    addNewChat,
    getChatPartner,
    getChatName,
    getChatAvatar
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
