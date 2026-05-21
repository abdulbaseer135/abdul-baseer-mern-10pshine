import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from '../../components/common/Spinner/Spinner';


const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { handleLogin, loading, error, handleClearError } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    handleClearError();
    const success = await handleLogin(data);
    if (success) navigate('/dashboard');
  };


  return (
    <div className="
      min-h-screen
      flex items-center justify-center
      px-4 py-12
    "
    style={{ backgroundColor: 'var(--surface-page-bg)' }}>

      {/* ─── Card Container ────────────────────────────────────────── */}
      <div className="w-full max-w-md">

        {/* ─── Logo / Brand ────────────────────────────── */}
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
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1
            text-slate-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Sign in to access your notes
          </p>
        </div>

        {/* ─── Panel ───────────────────────────────────── */}
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

            {/* Email */}
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

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold"
                  style={{ color: 'var(--text-primary)' }}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium transition-colors duration-150"
                  style={{ color: 'var(--accent-primary)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--accent-hover)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--accent-primary)'}
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className={`
                  w-full px-3.5 py-2.5 rounded-lg text-sm
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
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
              />
              {errors.password && (
                <p className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--danger-primary)' }}>
                  <ErrorIcon size={11} /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
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
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>

          </form>
        </div>

        {/* ─── Footer Link ───────────────────────────────── */}
        <p className="text-center text-sm mt-5"
          style={{ color: 'var(--text-tertiary)' }}>
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold transition-colors duration-150"
            style={{ color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--accent-primary)'}
          >
            Create one
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
    <line x1="12" y1="8"     x2="12"    y2="12"/>
    <line x1="12" y1="16"    x2="12.01" y2="16"/>
  </svg>
);


export default LoginPage;