import { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPasswordService } from '../../services/auth.service';

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8)        score++;
  if (/[A-Z]/.test(password))      score++;
  if (/[a-z]/.test(password))      score++;
  if (/\d/.test(password))         score++;
  if (/[!@#$%^&*]/.test(password)) score++;
  if (score <= 2) return { score, label: 'Weak',   color: 'bg-red-400    dark:bg-red-500'    };
  if (score === 3) return { score, label: 'Fair',   color: 'bg-yellow-400 dark:bg-yellow-500' };
  if (score === 4) return { score, label: 'Good',   color: 'bg-blue-400   dark:bg-blue-500'   };
  return            { score, label: 'Strong', color: 'bg-green-500  dark:bg-green-400'  };
};

const strengthTextColor = {
  Weak:   'text-red-500    dark:text-red-400',
  Fair:   'text-yellow-500 dark:text-yellow-400',
  Good:   'text-blue-500   dark:text-blue-400',
  Strong: 'text-green-600  dark:text-green-400',
};

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordValue = watch('newPassword', '');
  const strength = getPasswordStrength(passwordValue);

  const inputClass = (hasError) => `
    w-full px-4 py-2.5 rounded-xl text-sm
    bg-gray-50 dark:bg-white/[0.04]
    text-gray-900 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-700
    border transition-all duration-200
    focus:outline-none focus:ring-3
    ${hasError
      ? 'border-red-400 dark:border-red-500/60 focus:ring-red-400/15 dark:focus:ring-red-500/15'
      : 'border-gray-200 dark:border-white/[0.08] focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-indigo-400/15 dark:focus:ring-indigo-500/20'
    }
  `;

  // Redirect if no email in state
  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await resetPasswordService(email, data.newPassword);
      setSuccess(true);
      // Navigate to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
      min-h-screen
      bg-gray-50 dark:bg-[#0a0a0a]
      flex items-center justify-center
      px-4 py-12
      transition-colors duration-200
    ">
      <div className="w-full max-w-md">

        {/* ─── Brand Header ──────────────────────────── */}
        <div className="text-center mb-8">
          <div className="
            inline-flex items-center justify-center
            w-12 h-12 rounded-2xl mb-4
            bg-indigo-600 dark:bg-indigo-500
            shadow-lg shadow-indigo-500/30
          ">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight
            text-gray-900 dark:text-white">
            Reset Password
          </h1>
          <p className="text-sm mt-1.5 text-gray-600 dark:text-gray-400">
            Create a new password for your account
          </p>
        </div>

        {/* ─── Panel ─────────────────────────────────── */}
        <div className="
          bg-white dark:bg-[#141414]
          border border-gray-200/60 dark:border-white/[0.07]
          rounded-2xl
          shadow-xl shadow-gray-200/60 dark:shadow-black/40
          p-7
        ">

          {/* Success Banner */}
          {success && (
            <div className="
              flex items-start gap-2.5
              px-4 py-3 rounded-xl mb-5
              bg-green-50 dark:bg-green-500/[0.08]
              border border-green-200 dark:border-green-500/[0.15]
              text-green-600 dark:text-green-400 text-sm
            ">
              <CheckIcon />
              <span>Password reset successfully! Redirecting to login...</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="
              flex items-start gap-2.5
              px-4 py-3 rounded-xl mb-5
              bg-red-50 dark:bg-red-500/[0.08]
              border border-red-200 dark:border-red-500/[0.15]
              text-red-600 dark:text-red-400 text-sm
            ">
              <ErrorIcon />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* ─── New Password ──────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reset-new-password" className="text-xs font-semibold uppercase tracking-wider
                text-gray-600 dark:text-gray-400">
                New Password
              </label>
              <div className="relative">
                <input
                  id="reset-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className={`${inputClass(!!errors.newPassword)} pr-11`}
                  {...register('newPassword', {
                    required: 'Password is required',
                    pattern: {
                      value: PASSWORD_RULES,
                      message: 'Does not meet all requirements below',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(v => !v)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-400 dark:text-gray-600
                    hover:text-gray-700 dark:hover:text-gray-300
                    transition-colors duration-200
                  "
                >
                  {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {passwordValue.length > 0 && (
                <div className="mt-1">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className={`
                        h-0.5 flex-1 rounded-full transition-all duration-300
                        ${i <= strength.score ? strength.color : 'bg-gray-200 dark:bg-white/[0.07]'}
                      `}/>
                    ))}
                  </div>
                  {strength.label && (
                    <p className={`text-xs font-medium ${strengthTextColor[strength.label]}`}>
                      {strength.label} password
                    </p>
                  )}
                </div>
              )}

              {errors.newPassword && (
                <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                  <ErrorIcon size={11} /> {errors.newPassword.message}
                </p>
              )}

              <ul className="mt-1 grid gap-1">
                {[
                  { rule: /.{8,}/,        label: 'At least 8 characters' },
                  { rule: /[A-Z]/,         label: 'One uppercase letter' },
                  { rule: /[a-z]/,         label: 'One lowercase letter' },
                  { rule: /\d/,            label: 'One number' },
                  { rule: /[!@#$%^&*]/,    label: 'One special character (!@#$%^&*)' },
                ].map(({ rule, label }) => {
                  const passed = rule.test(passwordValue);
                  return (
                    <li key={label} className={`flex items-center gap-1.5 text-xs transition-colors duration-200
                      ${passed ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {passed ? <CheckIcon /> : <DotIcon />}
                      {label}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* ─── Confirm Password ──────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reset-confirm-password" className="text-xs font-semibold uppercase tracking-wider
                text-gray-600 dark:text-gray-400">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className={`${inputClass(!!errors.confirmPassword)} pr-11`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === passwordValue || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-400 dark:text-gray-600
                    hover:text-gray-700 dark:hover:text-gray-300
                    transition-colors duration-200
                  "
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                  <ErrorIcon size={11} /> {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* ─── Submit ────────────────────────────── */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-2.5 rounded-xl text-sm font-semibold
                bg-indigo-600 hover:bg-indigo-500
                text-white shadow-lg shadow-indigo-500/25
                disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                transition-all duration-200 mt-6
              "
            >
              {loading ? (
                <>
                  <SpinnerIcon /> Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    className="shrink-0 mt-px">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const DotIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
    <circle cx="12" cy="12" r="4"/>
  </svg>
);

const ErrorIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    className="shrink-0 mt-px">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8"  x2="12"    y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

ErrorIcon.propTypes = {
  size: PropTypes.number,
};

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
  </svg>
);

export default ResetPasswordPage;
