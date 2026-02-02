/**
 * @fileoverview FadeIn Transition Component
 * @description Animated wrapper for fade-in effects
 */

import { useState, useEffect, useRef } from 'react';
import './Transitions.css';

/**
 * FadeIn component for smooth entrance animations
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to animate
 * @param {string} [props.direction='up'] - Animation direction: up, down, left, right
 * @param {number} [props.delay=0] - Delay in milliseconds before animation starts
 * @param {number} [props.duration=300] - Animation duration in milliseconds
 * @param {boolean} [props.show=true] - Control visibility
 * @param {string} [props.className] - Additional CSS classes
 * @param {function} [props.onAnimationEnd] - Callback after animation completes
 */
const FadeIn = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 300,
  show = true,
  className = '',
  onAnimationEnd
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, delay]);

  const style = {
    '--fade-duration': `${duration}ms`,
    '--fade-delay': `${delay}ms`
  };

  const handleAnimationEnd = () => {
    if (onAnimationEnd) {
      onAnimationEnd();
    }
  };

  return (
    <div
      ref={elementRef}
      className={`fade-in fade-in-${direction} ${isVisible ? 'visible' : ''} ${className}`}
      style={style}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
};

/**
 * SlideIn component for sliding entrance animations
 */
export const SlideIn = ({
  children,
  direction = 'right',
  delay = 0,
  duration = 300,
  show = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, delay]);

  const style = {
    '--slide-duration': `${duration}ms`
  };

  return (
    <div
      className={`slide-in slide-in-${direction} ${isVisible ? 'visible' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

/**
 * ScaleIn component for scaling entrance animations
 */
export const ScaleIn = ({
  children,
  delay = 0,
  duration = 300,
  show = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, delay]);

  const style = {
    '--scale-duration': `${duration}ms`
  };

  return (
    <div
      className={`scale-in ${isVisible ? 'visible' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

/**
 * Stagger children animations
 */
export const StaggerChildren = ({
  children,
  staggerDelay = 50,
  baseDelay = 0,
  className = ''
}) => {
  return (
    <div className={`stagger-container ${className}`}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <FadeIn key={index} delay={baseDelay + index * staggerDelay} direction="up">
              {child}
            </FadeIn>
          ))
        : children}
    </div>
  );
};

export default FadeIn;
