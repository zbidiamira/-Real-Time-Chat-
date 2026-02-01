/**
 * Chat Page Component
 * Main chat interface with sidebar and chat window
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ChatSidebar, ChatWindow } from '../components/chat';
import './Chat.css';

/**
 * Chat page component - Main authenticated view
 */
const Chat = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      showToast('success', 'You have been logged out successfully.');
      navigate('/login', { replace: true });
    } catch (err) {
      showToast('error', 'Logout failed. Please try again.');
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="chat-page">
      <ChatSidebar onLogout={handleLogout} />
      <ChatWindow />
    </div>
  );
};

export default Chat;
