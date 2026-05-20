import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';


const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;


const getPasswordStrength = (password) => {
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

const strengthTextColor = {
  Weak:   'text-red-500   dark:text-red-400',
  Fair:   'text-yellow-500 dark:text-yellow-400',
  Good:   'text-blue-500  dark:text-blue-400',
  Strong: 'text-green-600 dark:text-green-400',
};


const SignupPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { handleRegister, loading, error, handleClearError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const passwordValue = watch('password', '');
  const strength      = getPasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    handleClearError();
    const success = await handleRegister(data);
    if (success) {
      // Redirect to OTP verification with email and purpose
      navigate('/verify-otp', { 
        state: { 
          email: data.email,
          purpose: 'verify'
        }
      });
    }
  };

  // ─── Shared input class builder ──────────────────
  const inputClass = (hasError) => `
    w-full px-3 py-2 rounded-md text-sm
    bg-white dark:bg-slate-900
    text-slate-900 dark:text-slate-100
    placeholder-slate-400 dark:placeholder-slate-500
    border transition-all duration-150
    focus:outline-none
    ${hasError
      ? 'border-red-500 dark:border-red-600 focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-600/20'
      : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20'
    }
  `;


  return (
    <div className="
      min-h-screen
      flex items-center justify-center
      px-4 py-12
    "
    style={{ backgroundColor: 'var(--surface-page-bg)' }}>
      <div className="w-full max-w-md">

        {/* ─── Brand Header ──────────────────────────── */}
        <div className="text-center mb-7">
          <div className="
            inline-flex items-center justify-center
            w-11 h-11 rounded-lg mb-3.5
            bg-indigo-600 dark:bg-indigo-500
          ">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1
            text-slate-900 dark:text-white">
            Create your account
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Start organizing your notes today
          </p>
        </div>

        {/* ─── Panel ─────────────────────────────────── */}
        <div className="
          rounded-lg
          border
          p-6
        "
        style={{
          backgroundColor: 'var(--surface-elevated)',
          borderColor: 'var(--border-default)',
          boxShadow: 'var(--shadow-md)'
        }}>

          {/* Error Banner */}
          {error && (
            <div className="
              flex items-start gap-2.5
              px-3 py-2.5 rounded-md mb-4
              border text-sm
            "
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderColor: 'var(--danger-primary)',
              color: 'var(--danger-primary)'
            }}>
              <ErrorIcon />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* ─── Full Name ─────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold"
                style={{ color: 'var(--text-primary)' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Abdul Baseer"
                className={`
                  w-full px-3.5 py-2.5 rounded-lg text-sm
                  border transition-all duration-150
                  focus:outline-none focus:ring-2
                  ${errors.name
                    ? 'focus:ring-red-500/30'
                    : 'focus:ring-indigo-500/30'
                  }
                `}
                style={{
                  backgroundColor: 'var(--surface-input)',
                  borderColor: errors.name ? 'var(--danger-primary)' : 'var(--border-default)',
                  color: 'var(--text-primary)',
                  ...{
                    '--tw-ring-color': errors.name ? 'rgba(255, 107, 107, 0.3)' : 'rgba(129, 140, 248, 0.3)'
                  }
                }}
                onFocus={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = 'var(--border-focus)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = 'var(--border-default)';
                  }
                }}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Minimum 2 characters' },
                })}
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--danger-primary)' }}>
                  <ErrorIcon size={11} /> {errors.name.message}
                </p>
              )}
            </div>

            {/* ─── Email ─────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold"
                style={{ color: 'var(--text-primary)' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`
                  w-full px-3.5 py-2.5 rounded-lg text-sm
                  border transition-all duration-150
                  focus:outline-none focus:ring-2
                  ${errors.email
                    ? 'focus:ring-red-500/30'
                    : 'focus:ring-indigo-500/30'
                  }
                `}
                style={{
                  backgroundColor: 'var(--surface-input)',
                  borderColor: errors.email ? 'var(--danger-primary)' : 'var(--border-default)',
                  color: 'var(--text-primary)',
                  ...{
                    '--tw-ring-color': errors.email ? 'rgba(255, 107, 107, 0.3)' : 'rgba(129, 140, 248, 0.3)'
                  }
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = 'var(--border-focus)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = 'var(--border-default)';
                  }
                }}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--danger-primary)' }}>
                  <ErrorIcon size={11} /> {errors.email.message}
                </p>
              )}
            </div>

            {/* ─── Password ──────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold"
                style={{ color: 'var(--text-primary)' }}>
                Password
              </label>

              {/* Input + eye toggle */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`
                    w-full px-3.5 py-2.5 rounded-lg text-sm pr-10
                    border transition-all duration-150
                    focus:outline-none focus:ring-2
                    ${errors.password
                      ? 'focus:ring-red-500/30'
                      : 'focus:ring-indigo-500/30'
                    }
                  `}
                  style={{
                    backgroundColor: 'var(--surface-input)',
                    borderColor: errors.password ? 'var(--danger-primary)' : 'var(--border-default)',
                    color: 'var(--text-primary)',
                    ...{
                      '--tw-ring-color': errors.password ? 'rgba(255, 107, 107, 0.3)' : 'rgba(129, 140, 248, 0.3)'
                    }
                  }}
                  onFocus={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = 'var(--border-focus)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = 'var(--border-default)';
                    }
                  }}
                  {...register('password', {
                    required: 'Password is required',
                    pattern: {
                      value: PASSWORD_RULES,
                      message: 'Does not meet all requirements below',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Strength Bar */}
              {passwordValue.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1.5 mb-1.5">
                    {[1, 2, 3, 4, 5].map((i) => {
                      const isActive = i <= strength.score;
                      let barColor = 'var(--border-subtle)';
                      if (isActive) {
                        if (strength.label === 'Weak') barColor = 'var(--danger-primary)';
                        else if (strength.label === 'Fair') barColor = 'var(--warning-primary)';
                        else if (strength.label === 'Good') barColor = 'var(--info-primary)';
                        else if (strength.label === 'Strong') barColor = 'var(--success-primary)';
                      }
                      return (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ backgroundColor: barColor }}
                        />
                      );
                    })}
                  </div>
                  {strength.label && (
                    <p className="text-xs font-medium"
                      style={{
                        color: strength.label === 'Weak' ? 'var(--danger-primary)' :
                               strength.label === 'Fair' ? 'var(--warning-primary)' :
                               strength.label === 'Good' ? 'var(--info-primary)' :
                               'var(--success-primary)'
                      }}>
                      {strength.label} password
                    </p>
                  )}
                </div>
              )}

              {errors.password && (
                <p className="flex items-center gap-1 text-xs mt-2"
                  style={{ color: 'var(--danger-primary)' }}>
                  <ErrorIcon size={11} /> {errors.password.message}
                </p>
              )}

              {/* Password Rules Checklist — Premium & Clean */}
              <ul className="mt-2.5 space-y-1">
                {[
                  { rule: /.{8,}/,        label: '8+ characters' },
                  { rule: /[A-Z]/,         label: 'Uppercase letter' },
                  { rule: /[a-z]/,         label: 'Lowercase letter' },
                  { rule: /\d/,            label: 'Number' },
                  { rule: /[!@#$%^&*]/,    label: 'Special character' },
                ].map(({ rule, label }) => {
                  const passed = rule.test(passwordValue);
                  return (
                    <li key={label}
                      className="flex items-center gap-2 text-xs transition-colors duration-200"
                      style={{
                        color: passed ? 'var(--success-primary)' : 'var(--text-muted)'
                      }}
                    >
                      {passed
                        ? <CheckIcon />
                        : <DotIcon />
                      }
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* ─── Submit ────────────────────────────── */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-2.5 mt-2 rounded-lg
                text-sm font-semibold text-white
                bg-indigo-600 dark:bg-indigo-500
                hover:bg-indigo-700 dark:hover:bg-indigo-600
                active:bg-indigo-800 dark:active:bg-indigo-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150
                flex items-center justify-center gap-2.5
                shadow-sm hover:shadow-md
              "
              style={{
                boxShadow: loading ? 'var(--shadow-sm)' : 'var(--shadow-sm)',
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = 'var(--accent-hover)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = 'var(--accent-primary)';
                  e.target.style.boxShadow = 'var(--shadow-sm)';
                }
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>

          </form>
        </div>

        {/* ─── Footer Link ───────────────────────────── */}
        <p className="text-center text-sm mt-5"
          style={{ color: 'var(--text-tertiary)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold transition-colors duration-150"
            style={{ color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--accent-primary)'}
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};


/* ─── Icons ──────────────────────────────────────────── */

const ErrorIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    className="shrink-0 mt-px">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8"  x2="12"    y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="flex-shrink-0">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="flex-shrink-0">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    className="shrink-0">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const DotIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    className="shrink-0">
    <circle cx="12" cy="12" r="4"/>
  </svg>
);


export default SignupPage;