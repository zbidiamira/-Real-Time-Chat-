/**
 * Main Layout Component
 * Layout wrapper for authenticated pages with sidebar
 */

import { useState } from 'react';
import './MainLayout.css';

/**
 * MainLayout component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.sidebar - Sidebar content
 * @param {React.ReactNode} props.children - Main content
 */
const MainLayout = ({ sidebar, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className={`main-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Mobile Overlay */}
      <div 
        className="sidebar-overlay"
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <aside className="main-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">💬</span>
            <span className="logo-text">ChatApp</span>
          </div>
          <button 
            className="sidebar-toggle mobile-only"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <div className="sidebar-content">
          {sidebar}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Mobile Header */}
        <div className="mobile-header mobile-only">
          <button 
            className="menu-toggle"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            ☰
          </button>
          <span className="mobile-title">ChatApp</span>
        </div>
        
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
