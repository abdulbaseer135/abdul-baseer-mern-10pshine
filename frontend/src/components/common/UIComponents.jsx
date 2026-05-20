/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHARED UI COMPONENT LIBRARY
 * Premium SaaS-style reusable components with consistent design language
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';

// ────────────────────────────────────────────────────────────────────────────
// BUTTONS
// ────────────────────────────────────────────────────────────────────────────

export const Button = ({
  children,
  variant = 'primary', // primary | secondary | ghost | danger | success
  size = 'md', // sm | md | lg
  icon: Icon,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = {
    sm: 'px-2.5 py-1.5 text-xs font-semibold',
    md: 'px-3 py-2 text-sm font-semibold',
    lg: 'px-4 py-2.5 text-base font-semibold',
  };

  const variantStyles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md transition-all duration-150 ${baseStyles[size]} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// FORM INPUTS
// ────────────────────────────────────────────────────────────────────────────

export const TextInput = React.forwardRef(({
  label,
  error,
  helperText,
  required = false,
  success = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  const hasError = error && error.length > 0;
  const showSuccess = success && !hasError;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className={`label-base ${required ? 'label-required' : ''}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
        )}
        <input
          ref={ref}
          className={`input-base ${Icon ? 'pl-9' : ''} ${hasError ? 'input-error' : ''} ${showSuccess ? 'input-success' : ''} ${className}`}
          disabled={disabled}
          {...props}
        />
      </div>
      {hasError && (
        <div className="helper-text-error">
          <span>•</span>
          <span>{error}</span>
        </div>
      )}
      {showSuccess && (
        <div className="helper-text-success">
          <span>✓</span>
          <span>{helperText}</span>
        </div>
      )}
      {helperText && !hasError && !showSuccess && (
        <p className="helper-text">{helperText}</p>
      )}
    </div>
  );
});

TextInput.displayName = 'TextInput';

export const SearchInput = React.forwardRef(({
  placeholder = 'Search...',
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
      )}
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className={`input-search ${className}`}
        {...props}
      />
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

// ────────────────────────────────────────────────────────────────────────────
// CATEGORY PILLS / TAGS
// ────────────────────────────────────────────────────────────────────────────

export const Pill = ({
  children,
  color = 'slate', // indigo | red | green | amber | slate
  isActive = true,
  onRemove,
  icon: Icon,
  onClick,
  className = '',
  ...props
}) => {
  const colorClass = {
    indigo: 'pill-indigo',
    red: 'pill-red',
    green: 'pill-green',
    amber: 'pill-amber',
    slate: 'pill-slate',
  }[color];

  return (
    <div
      className={`pill-base ${colorClass} ${!isActive ? 'pill-inactive' : ''} ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      {...props}
    >
      {Icon && <Icon size={14} />}
      <span>{children}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:text-current opacity-70 hover:opacity-100"
          aria-label={`Remove ${children}`}
        >
          ✕
        </button>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// SEGMENTED CONTROL / TAB SELECTOR
// ────────────────────────────────────────────────────────────────────────────

export const SegmentedControl = ({
  options, // Array of { label, value, icon? }
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`segmented-control ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`segmented-control-item ${value === option.value ? 'segmented-control-item-active' : ''}`}
        >
          {option.icon && <option.icon size={14} className="inline mr-1" />}
          {option.label}
        </button>
      ))}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// CARDS
// ────────────────────────────────────────────────────────────────────────────

export const Card = ({ children, variant = 'default', className = '', ...props }) => {
  const variantClass = {
    default: 'card',
    elevated: 'card-elevated',
    interactive: 'card-interactive',
    featured: 'card-featured',
    compact: 'card-compact',
  }[variant];

  return (
    <div className={`${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // sm | md | lg
  className = '',
}) => {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className={`modal-card ${sizeStyles[size]} pointer-events-auto w-full mx-4 ${className}`}>
          {title && (
            <div className="modal-header">
              <h2 className="modal-title">{title}</h2>
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg leading-none"
              >
                ✕
              </button>
            </div>
          )}
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ────────────────────────────────────────────────────────────────────────────

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {Icon && <Icon className="empty-state-icon" />}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// HELPER TEXT COMPONENTS
// ────────────────────────────────────────────────────────────────────────────

export const HelperText = ({ children, error = false, success = false }) => {
  if (error) {
    return (
      <div className="helper-text-error">
        <span>•</span>
        <span>{children}</span>
      </div>
    );
  }
  if (success) {
    return (
      <div className="helper-text-success">
        <span>✓</span>
        <span>{children}</span>
      </div>
    );
  }
  return <p className="helper-text">{children}</p>;
};

export const Label = ({ children, required = false, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`label-base ${required ? 'label-required' : ''} ${className}`}>
    {children}
  </label>
);

// ────────────────────────────────────────────────────────────────────────────
// UTILITY: FORM FIELD WRAPPER (Groups label + input + helper text)
// ────────────────────────────────────────────────────────────────────────────

export const FormField = ({
  label,
  required,
  children,
  helperText,
  error,
  success,
  className = '',
}) => {
  const hasError = error && error.length > 0;
  const showSuccess = success && !hasError;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {hasError && <HelperText error>{error}</HelperText>}
      {showSuccess && <HelperText success>{helperText}</HelperText>}
      {helperText && !hasError && !showSuccess && <HelperText>{helperText}</HelperText>}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// BADGE / STATUS INDICATOR
// ────────────────────────────────────────────────────────────────────────────

export const Badge = ({
  children,
  variant = 'neutral', // accent | danger | success | neutral
  size = 'sm',
  className = '',
}) => {
  const variantClass = {
    accent: 'badge-accent',
    danger: 'badge-danger',
    success: 'badge-success',
    neutral: 'badge-neutral',
  }[variant];

  return <span className={`${variantClass} ${className}`}>{children}</span>;
};

// ────────────────────────────────────────────────────────────────────────────
// NOTIFICATION / ALERT BOX
// ────────────────────────────────────────────────────────────────────────────

export const Alert = ({
  type = 'info', // info | success | warning | error
  title,
  message,
  onClose,
  icon: Icon,
  className = '',
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800/50',
      text: 'text-blue-900 dark:text-blue-200',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800/50',
      text: 'text-green-900 dark:text-green-200',
      icon: 'text-green-600 dark:text-green-400',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-800/50',
      text: 'text-amber-900 dark:text-amber-200',
      icon: 'text-amber-600 dark:text-amber-400',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800/50',
      text: 'text-red-900 dark:text-red-200',
      icon: 'text-red-600 dark:text-red-400',
    },
  }[type];

  return (
    <div className={`flex gap-3 p-3 rounded-md border ${styles.bg} ${styles.border} ${className}`}>
      {Icon && <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />}
      <div className="flex-1">
        {title && <p className={`text-sm font-semibold ${styles.text} mb-0.5`}>{title}</p>}
        <p className={`text-xs ${styles.text}`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// PANEL / CONTAINER COMPONENTS
// ────────────────────────────────────────────────────────────────────────────

export const Panel = ({ children, nested = false, className = '' }) => {
  const panelClass = nested ? 'panel-nested' : 'panel';
  return <div className={`${panelClass} ${className}`}>{children}</div>;
};

export const DangerZone = ({ children, className = '' }) => (
  <div className={`danger-zone ${className}`}>{children}</div>
);
