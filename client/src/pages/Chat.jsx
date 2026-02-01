/**
 * Chat Page Component
 * Main chat interface (placeholder for PR #8)
 */

import { useAuth } from '../hooks/useAuth';
import { MainLayout } from '../components/layout';
import { Header } from '../components/layout';
import './Chat.css';

/**
 * Chat page component - Main authenticated view
 */
const Chat = () => {
  const { user, logout } = useAuth();

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  /**
   * Handle profile click
   */
  const handleProfileClick = () => {
    // TODO: Implement profile modal/drawer
    console.log('Profile clicked');
  };

  /**
   * Handle theme toggle
   */
  const handleThemeToggle = () => {
    // TODO: Implement theme toggle in PR #15
    console.log('Theme toggle clicked');
  };

  // Sidebar placeholder
  const sidebarContent = (
    <div className="sidebar-placeholder">
      <Header 
        user={user}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
        onThemeToggle={handleThemeToggle}
      />
      <div className="chat-list-placeholder">
        <p>Chat list will appear here</p>
        <p className="placeholder-hint">PR #10 will implement the full chat sidebar</p>
      </div>
    </div>
  );

  return (
    <MainLayout sidebar={sidebarContent}>
      <div className="chat-main">
        <div className="chat-welcome">
          <div className="welcome-icon">💬</div>
          <h2 className="welcome-title">Welcome, {user?.name}!</h2>
          <p className="welcome-subtitle">
            Select a chat to start messaging or search for users to connect with.
          </p>
          <div className="welcome-features">
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <span>Private & Group Chats</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Real-time Messaging</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📎</span>
              <span>File Sharing</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Chat;
