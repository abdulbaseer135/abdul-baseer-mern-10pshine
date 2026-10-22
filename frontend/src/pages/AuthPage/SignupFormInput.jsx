import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';
import { ErrorIcon } from './FormComponents';

const SignupFormInput = ({ name, type, placeholder, register, errors, validationRules, showToggle, showPassword, setShowPassword }) => {
  const hasError = !!errors[name];
  // Sonar: extract nested ternary
  let inputType = type;
  if (showToggle && name === 'password') {
    inputType = showPassword ? 'text' : 'password';
  }

  const getInputStyles = (hasError) => ({
    backgroundColor: 'var(--surface-input)',
    borderColor: hasError ? 'var(--danger-primary)' : 'var(--border-default)',
    color: 'var(--text-primary)',
  });

  const getInputClassName = (hasError) => `
    w-full px-3.5 py-2.5 rounded-lg text-sm
    border transition-all duration-150
    focus:outline-none focus:ring-2
    ${showToggle ? 'pr-12' : ''}
    ${hasError ? 'focus:ring-red-500/30' : 'focus:ring-indigo-500/30'}
  `;

  const fieldId = `signup-field-${name}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </label>
      <div className={showToggle ? 'relative' : ''}>
        <input
          id={fieldId}
          type={inputType}
          autoComplete={name === 'password' ? 'new-password' : undefined}
          placeholder={placeholder}
          className={getInputClassName(hasError)}
          style={getInputStyles(hasError)}
          onFocus={(e) => !hasError && (e.target.style.borderColor = 'var(--border-focus)')}
          onBlur={(e) => !hasError && (e.target.style.borderColor = 'var(--border-default)')}
          {...register(name, validationRules)}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            aria-controls={fieldId}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-10 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {hasError && (
        <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--danger-primary)' }}>
          <ErrorIcon size={11} /> {errors[name].message}
        </p>
      )}
    </div>
  );
};

SignupFormInput.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  validationRules: PropTypes.object.isRequired,
  showToggle: PropTypes.bool,
  showPassword: PropTypes.bool,
  setShowPassword: PropTypes.func,
};

export default SignupFormInput;
