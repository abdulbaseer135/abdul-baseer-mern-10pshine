import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { PASSWORD_RULES, getPasswordStrength, ErrorIcon } from './FormComponents';
import PasswordStrengthBar from './PasswordStrengthBar';
import PasswordValidationRequirements from './PasswordValidationRequirements';
import SignupFormInput from './SignupFormInput';

const SignupPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { handleRegister, loading, error, handleClearError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const passwordValue = watch('password', '');
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    handleClearError();
    const success = await handleRegister(data);
    if (success) {
      navigate('/verify-otp', { state: { email: data.email, purpose: 'verify' } });
    }
  };

  const renderInput = (name, type, placeholder, validationRules, showToggle = false) => (
    <SignupFormInput
      name={name}
      type={type}
      placeholder={placeholder}
      register={register}
      errors={errors}
      validationRules={validationRules}
      showToggle={showToggle}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
    />
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--surface-page-bg)' }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-7">
          <div
            className="inline-flex items-center justify-center w-11 h-11 rounded-lg mb-3.5"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Create your account
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Start organizing your notes today
          </p>
        </div>

        {/* Form Panel */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: 'var(--surface-elevated)',
            borderColor: 'var(--border-default)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2.5 px-3 py-2.5 rounded-md mb-4 border text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderColor: 'var(--danger-primary)',
                color: 'var(--danger-primary)',
              }}
            >
              <ErrorIcon />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {renderInput('name', 'text', 'Abdul Baseer', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Minimum 2 characters' },
            })}

            {renderInput('email', 'email', 'you@example.com', {
              required: 'Email is required',
              pattern: {
                value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}

            {renderInput('password', 'password', '••••••••', {
              required: 'Password is required',
              pattern: { value: PASSWORD_RULES, message: 'Does not meet all requirements below' },
            }, true)}

            {passwordValue && <PasswordStrengthBar passwordValue={passwordValue} strength={strength} />}
            {passwordValue && <PasswordValidationRequirements password={passwordValue} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 flex items-center justify-center gap-2.5"
              style={{
                backgroundColor: 'var(--accent-primary)',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm mt-5" style={{ color: 'var(--text-tertiary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)' }} className="font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
