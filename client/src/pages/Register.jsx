/**
 * Register Page Component
 * User registration with name, email, and password
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout';
import { Button, Input } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import './Register.css';

/**
 * Register page component
 */
const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError, isAuthenticated } = useAuth();
  const toast = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      errors.name = 'Name cannot exceed 50 characters';
    }
    
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
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      
      // Show success toast
      toast.success('Account created successfully! Welcome to ChatApp.');
      
      // Redirect to home on success
      navigate('/', { replace: true });
    } catch (err) {
      // Show error toast
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return (
    <AuthLayout 
      title="Create account" 
      subtitle="Join ChatApp and start messaging"
    >
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        {/* Global Error */}
        {error && (
          <div className="form-error-global">
            {error}
          </div>
        )}

        {/* Name Input */}
        <Input
          type="text"
          name="name"
          label="Full Name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          error={formErrors.name}
          icon="👤"
          autoComplete="name"
          required
        />

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
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          hint="Must be at least 6 characters"
          icon="🔒"
          autoComplete="new-password"
          required
        />

        {/* Confirm Password Input */}
        <Input
          type="password"
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={formErrors.confirmPassword}
          icon="🔒"
          autoComplete="new-password"
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
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>

        {/* Login Link */}
        <p className="auth-link">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
