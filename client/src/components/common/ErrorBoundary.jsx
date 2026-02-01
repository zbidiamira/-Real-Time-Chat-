/**
 * @fileoverview Error Boundary Component
 * @description Catches JavaScript errors in child component tree
 */

import { Component } from 'react';
import ErrorFallback from './ErrorFallback';

/**
 * Error Boundary class component
 * React error boundaries must be class components
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Log error information
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error);
      console.error('Component stack:', errorInfo?.componentStack);
    }

    // Send error to monitoring service in production
    if (import.meta.env.PROD && this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset error state
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, FallbackComponent } = this.props;

    if (hasError) {
      // Custom fallback component
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            onReset={this.handleReset}
          />
        );
      }

      // Custom fallback element
      if (fallback) {
        return fallback;
      }

      // Default fallback
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
