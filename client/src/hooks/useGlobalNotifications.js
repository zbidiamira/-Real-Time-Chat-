/**
 * useGlobalNotifications Hook
 * Listens for global notification events from socket
 */

import { useEffect } from 'react';
import { useSocket } from './useSocket';
import { useNotification } from './useNotification';
import { useChat } from './useChat';

/**
 * Hook to listen for global notification events
 * Should be used at App level to catch all notifications
 */
export const useGlobalNotifications = () => {
  const { socket, isConnected, on, off } = useSocket();
  const { notifyNewMessage, addUnread, playNotificationSound, showBrowserNotification } = useNotification();
  const { updateChatLatestMessage, selectedChat } = useChat();

  useEffect(() => {
    if (!socket || !isConnected) return;

    /**
     * Handle new message notification from server
     * This event is sent to users not currently in the chat room
     */
    const handleNewMessageNotification = ({ chatId, message }) => {
      console.log('📬 New message notification received:', chatId);
      
      // Check if this is the currently active chat
      const isActiveChat = selectedChat?._id === chatId;
      
      // Update chat list with latest message
      if (updateChatLatestMessage) {
        updateChatLatestMessage({
          ...message,
          chat: chatId
        });
      }
      
      // Show notification if not active chat
      if (!isActiveChat) {
        // Add to unread count
        addUnread(chatId);
        
        // Play sound
        playNotificationSound();
        
        // Show browser notification
        const senderName = message.sender?.name || 'Someone';
        const content = message.content?.length > 50 
          ? message.content.substring(0, 50) + '...' 
          : message.content;
        
        showBrowserNotification(
          senderName,
          content,
          message.sender?.avatar
        );
      }
    };

    /**
     * Handle message received - for messages in active chat
     * This supplements the ChatWindow listener
     */
    const handleMessageReceived = (message) => {
      const chatId = message.chat?._id || message.chat;
      const isActiveChat = selectedChat?._id === chatId;
      
      // Update latest message in chat list
      if (updateChatLatestMessage) {
        updateChatLatestMessage(message);
      }
      
      // Notify if not in active chat
      if (!isActiveChat) {
        notifyNewMessage(message, chatId, false);
      }
    };

    // Subscribe to notification events
    on('new_message_notification', handleNewMessageNotification);
    on('message_received', handleMessageReceived);

    return () => {
      off('new_message_notification', handleNewMessageNotification);
      off('message_received', handleMessageReceived);
    };
  }, [
    socket, 
    isConnected, 
    on, 
    off, 
    selectedChat?._id, 
    notifyNewMessage, 
    addUnread, 
    playNotificationSound, 
    showBrowserNotification,
    updateChatLatestMessage
  ]);
};

export default useGlobalNotifications;
