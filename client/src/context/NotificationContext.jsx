/**
 * Notification Context
 * Manages unread message counts, notification sounds, and browser notifications
 */

import { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

// Create notification context
export const NotificationContext = createContext(null);

// Storage key for persisting unread counts
const STORAGE_KEY = 'chat_unread_counts';

/**
 * Load unread counts from localStorage
 * @returns {Object} Unread counts map
 */
const loadUnreadCounts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

/**
 * Save unread counts to localStorage
 * @param {Object} counts - Unread counts map
 */
const saveUnreadCounts = (counts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  } catch (err) {
    console.error('Failed to save unread counts:', err);
  }
};

/**
 * Notification Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  // Unread counts per chat: { chatId: count }
  const [unreadCounts, setUnreadCounts] = useState({});
  
  // Notification settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);
  
  // Audio context for generating notification sound
  const audioContextRef = useRef(null);

  /**
   * Create a notification beep sound using Web Audio API
   */
  const playBeep = useCallback(() => {
    try {
      // Create audio context lazily (required for user interaction)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure sound
      oscillator.frequency.value = 880; // A5 note
      oscillator.type = 'sine';
      
      // Set volume and fade out
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      // Play sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
      console.warn('Could not play notification sound:', err);
    }
  }, []);

  /**
   * Initialize browser notification permission check
   */
  useEffect(() => {
    // Check browser notification permission
    if ('Notification' in window && Notification.permission === 'granted') {
      setBrowserNotificationsEnabled(true);
    }
  }, []);

  /**
   * Load unread counts when user is authenticated
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      const stored = loadUnreadCounts();
      // Load user-specific counts
      const userCounts = stored[user._id] || {};
      setUnreadCounts(userCounts);
    } else {
      setUnreadCounts({});
    }
  }, [isAuthenticated, user]);

  /**
   * Save unread counts whenever they change
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      const stored = loadUnreadCounts();
      stored[user._id] = unreadCounts;
      saveUnreadCounts(stored);
    }
  }, [unreadCounts, isAuthenticated, user]);

  /**
   * Update document title with unread count
   */
  useEffect(() => {
    const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
    
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) Chat App`;
    } else {
      document.title = 'Chat App';
    }
  }, [unreadCounts]);

  /**
   * Play notification sound
   */
  const playNotificationSound = useCallback(() => {
    if (soundEnabled) {
      playBeep();
    }
  }, [soundEnabled, playBeep]);

  /**
   * Show browser notification
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {string} icon - Icon URL
   */
  const showBrowserNotification = useCallback((title, body, icon = '/default-avatar.png') => {
    if (!browserNotificationsEnabled || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon,
        tag: 'chat-message',
        renotify: true
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Focus window on click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, [browserNotificationsEnabled]);

  /**
   * Request browser notification permission
   * @returns {Promise<boolean>} Whether permission was granted
   */
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setBrowserNotificationsEnabled(granted);
      return granted;
    } catch {
      return false;
    }
  }, []);

  /**
   * Add unread count for a chat
   * @param {string} chatId - Chat ID
   * @param {number} count - Number to add (default: 1)
   */
  const addUnread = useCallback((chatId, count = 1) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [chatId]: (prev[chatId] || 0) + count
    }));
  }, []);

  /**
   * Clear unread count for a chat
   * @param {string} chatId - Chat ID
   */
  const clearUnread = useCallback((chatId) => {
    setUnreadCounts((prev) => {
      const { [chatId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Clear all unread counts
   */
  const clearAllUnread = useCallback(() => {
    setUnreadCounts({});
  }, []);

  /**
   * Get unread count for a specific chat
   * @param {string} chatId - Chat ID
   * @returns {number} Unread count
   */
  const getUnreadCount = useCallback((chatId) => {
    return unreadCounts[chatId] || 0;
  }, [unreadCounts]);

  /**
   * Get total unread count across all chats
   * @returns {number} Total unread count
   */
  const getTotalUnread = useCallback(() => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  }, [unreadCounts]);

  /**
   * Handle new message notification
   * @param {Object} message - Message object
   * @param {string} chatId - Chat ID
   * @param {boolean} isActiveChat - Whether this is the currently active chat
   */
  const notifyNewMessage = useCallback((message, chatId, isActiveChat = false) => {
    // Don't notify for own messages
    if (message.sender._id === user?._id || message.sender === user?._id) {
      return;
    }

    // Add to unread count if not active chat
    if (!isActiveChat) {
      addUnread(chatId);
      
      // Play sound
      playNotificationSound();
      
      // Show browser notification
      const senderName = message.sender.name || 'Someone';
      const content = message.content.length > 50 
        ? message.content.substring(0, 50) + '...' 
        : message.content;
      
      showBrowserNotification(
        senderName,
        content,
        message.sender.avatar
      );
    }
  }, [user, addUnread, playNotificationSound, showBrowserNotification]);

  /**
   * Toggle sound notifications
   */
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const value = {
    unreadCounts,
    soundEnabled,
    browserNotificationsEnabled,
    addUnread,
    clearUnread,
    clearAllUnread,
    getUnreadCount,
    getTotalUnread,
    notifyNewMessage,
    playNotificationSound,
    showBrowserNotification,
    requestNotificationPermission,
    toggleSound
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
