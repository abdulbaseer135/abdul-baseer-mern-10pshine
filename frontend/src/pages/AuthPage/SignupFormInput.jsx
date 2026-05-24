import PropTypes from 'prop-types';
import { ErrorIcon } from './FormComponents';

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

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
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
              background: 'transparent',
              border: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
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
