/**
 * Toast Context
 * Provides toast notification functionality throughout the app
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../components/common/Toast.css';

// Create toast context
const ToastContext = createContext(null);

/**
 * Single Toast Item
 */
const ToastItem = ({ id, type, message, onRemove, duration = 5000 }) => {
  // Auto-remove after duration
  useState(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);
    return () => clearTimeout(timer);
  });

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button 
        className="toast-close"
        onClick={() => onRemove(id)}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

/**
 * Toast Provider Component
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message, duration }]);
    
    // Auto-remove
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast('success', message, duration),
    error: (message, duration) => addToast('error', message, duration),
    warning: (message, duration) => addToast('warning', message, duration),
    info: (message, duration) => addToast('info', message, duration),
    remove: removeToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.length > 0 && createPortal(
        <div className="toast-container" aria-live="polite">
          {toasts.map(t => (
            <ToastItem
              key={t.id}
              {...t}
              onRemove={removeToast}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

/**
 * useToast Hook
 * Access toast methods from anywhere in the app
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default ToastContext;
