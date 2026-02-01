/**
 * @fileoverview Main Application Component
 * @description Root component that sets up routing, authentication, and global providers
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { ProtectedRoute } from './components/common';
import { Login, Register, Chat, NotFound } from './pages';

/**
 * Main App component
 * Sets up authentication provider, chat context, socket context, toast notifications, and routing
 * @returns {JSX.Element} The main application component
 */
function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ChatProvider>
          <SocketProvider>
            <BrowserRouter>
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
        </ChatProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
