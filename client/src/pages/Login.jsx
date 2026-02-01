/**
 * Login Page Component
 * User login with email and password
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/layout';
import { Button, Input } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import './Login.css';

/**
 * Login page component
 */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Get redirect path from location state
  const from = location.state?.from?.pathname || '/';

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error on change
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear auth error on change
    if (error) {
      clearError();
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    try {
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      
      // Redirect to previous page or home
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Login error:', err);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to continue to ChatApp"
    >
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        {/* Global Error */}
        {error && (
          <div className="form-error-global">
            {error}
          </div>
        )}

        {/* Email Input */}
        <Input
          type="email"
          name="email"
          label="Email Address"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          icon="📧"
          autoComplete="email"
          required
        />

        {/* Password Input */}
        <Input
          type="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          icon="🔒"
          autoComplete="current-password"
          required
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        {/* Register Link */}
        <p className="auth-link">
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
