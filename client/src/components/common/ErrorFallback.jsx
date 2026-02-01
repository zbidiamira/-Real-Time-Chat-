/**
 * @fileoverview Error Fallback Component
 * @description Displays a user-friendly error message when an error occurs
 */

import './ErrorFallback.css';

/**
 * ErrorFallback component displays error state with recovery options
 * @param {Object} props - Component props
 * @param {Error} props.error - The error that was caught
 * @param {Object} props.errorInfo - React error info with component stack
 * @param {Function} props.onReset - Callback to reset error state
 */
const ErrorFallback = ({ error, errorInfo, onReset }) => {
  const isDev = import.meta.env.DEV;

  /**
   * Reload the page
   */
  const handleReload = () => {
    window.location.reload();
  };

  /**
   * Go to home page
   */
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="error-fallback" role="alert" aria-live="assertive">
      <div className="error-fallback-content">
        {/* Error Icon */}
        <div className="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="error-title">Something went wrong</h1>
        <p className="error-message">
          We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
        </p>

        {/* Error Details (Development Only) */}
        {isDev && error && (
          <details className="error-details">
            <summary>Error Details (Development Only)</summary>
            <div className="error-stack">
              <p><strong>Error:</strong> {error.message}</p>
              {error.stack && (
                <pre>{error.stack}</pre>
              )}
              {errorInfo?.componentStack && (
                <>
                  <p><strong>Component Stack:</strong></p>
                  <pre>{errorInfo.componentStack}</pre>
                </>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="error-actions">
          {onReset && (
            <button className="error-btn error-btn-primary" onClick={onReset}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Try Again
            </button>
          )}
          <button className="error-btn error-btn-secondary" onClick={handleReload}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            Reload Page
          </button>
          <button className="error-btn error-btn-outline" onClick={handleGoHome}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
