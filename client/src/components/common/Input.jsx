/**
 * Input Component
 * Reusable form input with label and error
 */

import { forwardRef } from 'react';
import './Input.css';

/**
 * Input component
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type
 * @param {string} props.name - Input name
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Input value
 * @param {string} props.error - Error message
 * @param {string} props.hint - Hint text
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {Function} props.onChange - Change handler
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.icon - Icon element
 */
const Input = forwardRef(({
  label,
  type = 'text',
  name,
  placeholder,
  value,
  error,
  hint,
  required = false,
  disabled = false,
  onChange,
  className = '',
  icon,
  ...props
}, ref) => {
  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          ref={ref}
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`input ${icon ? 'input-with-icon' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="input-error-text">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
