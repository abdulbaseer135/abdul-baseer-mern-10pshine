import React from 'react';
import PropTypes from 'prop-types';

// Sonar: no duplicate ranges in character classes (/i flag)
export const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

// Password validation rules
export const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

// Password strength calculation
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8)       score++;
  if (/[A-Z]/.test(password))     score++;
  if (/[a-z]/.test(password))     score++;
  if (/\d/.test(password))        score++;
  if (/[!@#$%^&*]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak',   color: 'bg-red-400    dark:bg-red-500' };
  if (score === 3) return { score, label: 'Fair',   color: 'bg-yellow-400 dark:bg-yellow-500' };
  if (score === 4) return { score, label: 'Good',   color: 'bg-blue-400   dark:bg-blue-500' };
  return            { score, label: 'Strong', color: 'bg-green-500  dark:bg-green-400' };
};

export const strengthTextColor = {
  Weak:   'text-red-500   dark:text-red-400',
  Fair:   'text-yellow-500 dark:text-yellow-400',
  Good:   'text-blue-500  dark:text-blue-400',
  Strong: 'text-green-600 dark:text-green-400',
};

// Error icon SVG component
const ErrorIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// Reusable form field component
export const FormField = ({ 
  label, 
  type = 'text', 
  placeholder, 
  register, 
  name, 
  errors, 
  showError = true,
  inputRef,
  children
}) => {
  const fieldId = name ? `form-field-${name}` : undefined;

  return (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={fieldId} className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
        {label}
      </label>
    )}
    {children || (
      <input
        id={fieldId}
        type={type}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-lg text-sm border transition-all duration-150 focus:outline-none focus:ring-2 ${
          errors?.[name] ? 'focus:ring-red-500/30' : 'focus:ring-indigo-500/30'
        }`}
        style={{
          backgroundColor: 'var(--surface-input)',
          borderColor: errors?.[name] ? 'var(--danger-primary)' : 'var(--border-default)',
          color: 'var(--text-primary)',
        }}
        {...(register ? register(name) : {})}
        ref={inputRef}
      />
    )}
    {showError && errors?.[name] && (
      <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--danger-primary)' }}>
        <ErrorIcon size={11} /> {errors[name].message}
      </p>
    )}
  </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  register: PropTypes.func,
  name: PropTypes.string,
  errors: PropTypes.objectOf(
    PropTypes.shape({ message: PropTypes.string }),
  ),
  showError: PropTypes.bool,
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  children: PropTypes.node,
};

ErrorIcon.propTypes = {
  size: PropTypes.number,
};

export { ErrorIcon };
