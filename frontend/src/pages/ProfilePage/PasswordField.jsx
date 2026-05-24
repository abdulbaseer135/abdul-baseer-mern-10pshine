import PropTypes from 'prop-types';

// Sonar: accessibility — label htmlFor + input id
const PasswordField = ({
  label,
  placeholder,
  isVisible,
  onToggleVisibility,
  error,
  id: inputId = 'password-field',
  ...inputProps
}) => (
  <>
    {label && (
      <label htmlFor={inputId} className="text-xs font-semibold text-slate-900 dark:text-white">
        {label}
      </label>
    )}
    <div className="relative group">
      <input
        id={inputId}
        type={isVisible ? 'text' : 'password'}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2.5 pr-10 rounded-md text-sm
          bg-white dark:bg-slate-700/40
          text-slate-900 dark:text-white
          placeholder-slate-400 dark:placeholder-slate-500
          border transition-all duration-150
          focus:outline-none
          ${error
            ? 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-600/20'
            : 'border-slate-300 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20'
          }
        `}
        {...inputProps}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-150"
        style={{
          padding: 0,
          margin: 0,
          border: 'none',
          background: 'transparent',
          lineHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
      </button>
    </div>
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-300 font-medium">
        <span>•</span> {error.message}
      </p>
    )}
  </>
);

PasswordField.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  isVisible: PropTypes.bool,
  onToggleVisibility: PropTypes.func.isRequired,
  error: PropTypes.shape({ message: PropTypes.string }),
  id: PropTypes.string,
  size: PropTypes.number,
};

const EyeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

EyeIcon.propTypes = {
  size: PropTypes.number,
};

EyeOffIcon.propTypes = {
  size: PropTypes.number,
};

export default PasswordField;
