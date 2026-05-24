import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyOTPService, sendOTPService } from '../../services/auth.service';

const OTPVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const purpose = location.state?.purpose || 'verify'; // 'verify' or 'reset'

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate(purpose === 'verify' ? '/signup' : '/forgot-password');
    }
  }, [email, navigate, purpose]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-move to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await verifyOTPService(email, otpCode, purpose);
      setSuccess(true);

      // Navigate based on purpose
      setTimeout(() => {
        if (purpose === 'verify') {
          navigate('/login');
        } else if (purpose === 'reset') {
          navigate('/reset-password', { state: { email } });
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError(null);

    try {
      await sendOTPService(email, purpose);
      setResendCooldown(30);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
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
            Verify Your {purpose === 'verify' ? 'Email' : 'Identity'}
          </h1>
          <p className="text-sm mt-1.5 text-gray-600 dark:text-gray-400">
            Enter the 6-digit code sent to<br/>
            <span className="font-medium text-gray-700 dark:text-gray-400">{email}</span>
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
              <span>OTP verified! Redirecting...</span>
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

          <form onSubmit={onSubmit} className="space-y-6">

            {/* ─── OTP Input Boxes ─────────────────── */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={`otp-${index}-${digit || 'empty'}`}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="
                    w-12 h-12 sm:w-14 sm:h-14
                    text-center text-xl sm:text-2xl font-bold
                    rounded-xl
                    bg-gray-50 dark:bg-white/[0.04]
                    border-2 border-gray-200 dark:border-white/[0.08]
                    text-gray-900 dark:text-white
                    focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500
                    focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20
                    transition-all duration-200
                  "
                  placeholder="0"
                />
              ))}
            </div>

            {/* ─── Submit ────────────────────────────── */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
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
                  <SpinnerIcon /> Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || resendCooldown > 0}
                className="
                  text-indigo-600 dark:text-indigo-400 hover:underline font-medium
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </p>
          </div>

          {/* Back to previous */}
          <div className="mt-4 text-center">
            <Link
              to={purpose === 'verify' ? '/signup' : '/forgot-password'}
              className="text-xs text-gray-500 dark:text-gray-600 hover:underline"
            >
              ← Back
            </Link>
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

const SpinnerIcon = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
  </svg>
);

export default OTPVerificationPage;
