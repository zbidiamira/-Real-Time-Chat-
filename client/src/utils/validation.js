/**
 * @fileoverview Form Validation Utilities
 * @description Provides validation functions for forms throughout the application
 */

/**
 * Email regex pattern for validation
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password strength patterns
 */
const PASSWORD_PATTERNS = {
  minLength: /.{6,}/,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const trimmedEmail = email.trim();
  
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUpperCase = false,
    requireLowerCase = false,
    requireNumber = false,
    requireSpecialChar = false
  } = options;
  
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < minLength) {
    return { 
      isValid: false, 
      error: `Password must be at least ${minLength} characters long` 
    };
  }
  
  if (requireUpperCase && !PASSWORD_PATTERNS.hasUpperCase.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one uppercase letter' 
    };
  }
  
  if (requireLowerCase && !PASSWORD_PATTERNS.hasLowerCase.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one lowercase letter' 
    };
  }
  
  if (requireNumber && !PASSWORD_PATTERNS.hasNumber.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one number' 
    };
  }
  
  if (requireSpecialChar && !PASSWORD_PATTERNS.hasSpecialChar.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one special character' 
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} Validation result
 */
export const validatePasswordConfirm = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateName = (name, options = {}) => {
  const { minLength = 2, maxLength = 50, fieldName = 'Name' } = options;
  
  if (!name) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < minLength) {
    return { 
      isValid: false, 
      error: `${fieldName} must be at least ${minLength} characters long` 
    };
  }
  
  if (trimmedName.length > maxLength) {
    return { 
      isValid: false, 
      error: `${fieldName} must not exceed ${maxLength} characters` 
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate message content
 * @param {string} message - Message to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateMessage = (message, options = {}) => {
  const { maxLength = 5000, allowEmpty = false } = options;
  
  if (!message && !allowEmpty) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (message && message.length > maxLength) {
    return { 
      isValid: false, 
      error: `Message must not exceed ${maxLength} characters` 
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate group chat name
 * @param {string} name - Group name to validate
 * @returns {Object} Validation result
 */
export const validateGroupName = (name) => {
  return validateName(name, {
    minLength: 3,
    maxLength: 50,
    fieldName: 'Group name'
  });
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  } = options;
  
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return { 
      isValid: false, 
      error: `File size must not exceed ${maxSizeMB}MB` 
    };
  }
  
  // Check file type
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const fileExtension = '.' + fileName.split('.').pop();
  
  const isValidType = allowedTypes.includes(fileType) || 
                      allowedExtensions.includes(fileExtension);
  
  if (!isValidType) {
    return { 
      isValid: false, 
      error: `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}` 
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate form data object
 * @param {Object} data - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result with all errors
 */
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    
    for (const rule of fieldRules) {
      let result;
      
      switch (rule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && !value.trim())) {
            result = { isValid: false, error: rule.message || `${field} is required` };
          }
          break;
          
        case 'email':
          result = validateEmail(value);
          break;
          
        case 'password':
          result = validatePassword(value, rule.options);
          break;
          
        case 'name':
          result = validateName(value, rule.options);
          break;
          
        case 'minLength':
          if (value && value.length < rule.value) {
            result = { 
              isValid: false, 
              error: rule.message || `Must be at least ${rule.value} characters` 
            };
          }
          break;
          
        case 'maxLength':
          if (value && value.length > rule.value) {
            result = { 
              isValid: false, 
              error: rule.message || `Must not exceed ${rule.value} characters` 
            };
          }
          break;
          
        case 'match':
          if (value !== data[rule.field]) {
            result = { isValid: false, error: rule.message || 'Fields do not match' };
          }
          break;
          
        case 'custom':
          result = rule.validate(value, data);
          break;
          
        default:
          break;
      }
      
      if (result && !result.isValid) {
        errors[field] = result.error;
        isValid = false;
        break; // Stop checking other rules for this field
      }
    }
  }
  
  return { isValid, errors };
};

/**
 * Calculate password strength score
 * @param {string} password - Password to check
 * @returns {Object} Strength info
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, label: 'None', color: 'gray' };
  }
  
  let score = 0;
  
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (PASSWORD_PATTERNS.hasUpperCase.test(password)) score++;
  if (PASSWORD_PATTERNS.hasLowerCase.test(password)) score++;
  if (PASSWORD_PATTERNS.hasNumber.test(password)) score++;
  if (PASSWORD_PATTERNS.hasSpecialChar.test(password)) score++;
  
  const levels = [
    { min: 0, label: 'Very Weak', color: '#ef4444' },
    { min: 2, label: 'Weak', color: '#f97316' },
    { min: 4, label: 'Fair', color: '#eab308' },
    { min: 5, label: 'Good', color: '#22c55e' },
    { min: 7, label: 'Strong', color: '#10b981' }
  ];
  
  const level = [...levels].reverse().find(l => score >= l.min) || levels[0];
  
  return {
    score,
    maxScore: 7,
    percentage: Math.round((score / 7) * 100),
    label: level.label,
    color: level.color
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateName,
  validateMessage,
  validateGroupName,
  validateFile,
  validateForm,
  getPasswordStrength
};
