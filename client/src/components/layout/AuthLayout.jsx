/**
 * Auth Layout Component
 * Layout wrapper for authentication pages
 */

import './AuthLayout.css';

/**
 * AuthLayout component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 */
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">💬</span>
            <span className="logo-text">ChatApp</span>
          </div>
          {title && <h1 className="auth-title">{title}</h1>}
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>
        <div className="auth-content">
          {children}
        </div>
        <div className="auth-footer">
          <p>© 2026 ChatApp. Real-time messaging.</p>
        </div>
      </div>
      <div className="auth-background">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
      </div>
    </div>
  );
};

export default AuthLayout;
