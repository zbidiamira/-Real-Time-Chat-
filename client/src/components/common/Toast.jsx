/**
 * Toast Component
 * Notification toast for success/error messages
 */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

/**
 * Single Toast Item
 */
const ToastItem = ({ id, type, message, onRemove, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

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
 * Toast Container
 */
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          {...toast}
          onRemove={removeToast}
        />
      ))}
    </div>,
    document.body
  );
};

/**
 * useToast Hook
 * Custom hook for managing toast notifications
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    return addToast('success', message, duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    return addToast('error', message, duration);
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    return addToast('warning', message, duration);
  }, [addToast]);

  const info = useCallback((message, duration) => {
    return addToast('info', message, duration);
  }, [addToast]);

  return {
    toasts,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} removeToast={removeToast} />
  };
};

export default useToast;
