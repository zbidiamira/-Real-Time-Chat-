/**
 * @fileoverview Main Application Component
 * @description Root component that sets up routing, authentication, and global providers
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, ErrorBoundary, ErrorFallback } from './components/common';
import { Login, Register, Chat, NotFound } from './pages';

/**
 * Log error to external service (placeholder for production)
 * @param {Error} error - The error that was caught
 * @param {Object} errorInfo - Additional error information
 */
const logErrorToService = (error, errorInfo) => {
  // In production, send to error tracking service like Sentry
  if (import.meta.env.PROD) {
    console.error('Production error:', error);
    // TODO: Send to error tracking service
    // Sentry.captureException(error, { extra: errorInfo });
  }
};

/**
 * Main App component
 * Sets up authentication provider, chat context, socket context, toast notifications, and routing
 * @returns {JSX.Element} The main application component
 */
function App() {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={logErrorToService}
    >
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
          <ChatProvider>
            <NotificationProvider>
              <SocketProvider>
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Not Found */}
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </BrowserRouter>
              </SocketProvider>
            </NotificationProvider>
          </ChatProvider>
        </AuthProvider>
      </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
