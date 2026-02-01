/**
 * @fileoverview Main Application Component
 * @description Root component that sets up routing and global providers
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

/**
 * Main App component
 * @returns {JSX.Element} The main application component
 */
function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Home Route */}
          <Route 
            path="/" 
            element={
              <div className="welcome-container">
                <h1>💬 Chat App</h1>
                <p>Real-time messaging application</p>
                <div className="status-badge">
                  <span className="status-dot"></span>
                  Server Connected
                </div>
              </div>
            } 
          />

          {/* Login Route - Placeholder */}
          <Route 
            path="/login" 
            element={
              <div className="auth-container">
                <h2>Login</h2>
                <p>Login page coming in PR #8</p>
              </div>
            } 
          />

          {/* Register Route - Placeholder */}
          <Route 
            path="/register" 
            element={
              <div className="auth-container">
                <h2>Register</h2>
                <p>Register page coming in PR #8</p>
              </div>
            } 
          />

          {/* 404 Not Found */}
          <Route 
            path="*" 
            element={
              <div className="not-found-container">
                <h1>404</h1>
                <p>Page not found</p>
                <a href="/">Go back home</a>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
