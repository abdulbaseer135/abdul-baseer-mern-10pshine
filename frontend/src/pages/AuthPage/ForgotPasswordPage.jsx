import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { sendOTPService } from '../../services/auth.service';

const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await sendOTPService(data.email, 'reset');
      setSuccess(true);
      // Navigate to OTP verification page after 2 seconds
      setTimeout(() => {
        navigate('/verify-otp', { state: { email: data.email, purpose: 'reset' } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
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
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight
            text-gray-900 dark:text-white">
            Forgot Password?
          </h1>
          <p className="text-sm mt-1.5 text-gray-500 dark:text-gray-500">
            We'll send you an OTP to reset your password
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
              <span>OTP sent successfully! Redirecting...</span>
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

            {/* ─── Email ─────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider
                text-gray-400 dark:text-gray-600">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className={inputClass(errors.email)}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                  <ErrorIcon size={11} /> {errors.email.message}
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
                transition-all duration-200
              "
            >
              {loading ? (
                <>
                  <SpinnerIcon /> Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Back to login
              </Link>
            </p>
          </div>
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

const ErrorIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    className="shrink-0 mt-px">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8"  x2="12"    y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
  </svg>
);

export default ForgotPasswordPage;
