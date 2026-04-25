import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from '../../components/common/Spinner/Spinner';

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-400' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-400' };
  if (score === 4) return { score, label: 'Good', color: 'bg-blue-400' };
  return { score, label: 'Strong', color: 'bg-green-500' };
};

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
    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Account
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Start organizing your notes today
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Abdul Baseer"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
              })}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i, message: 'Invalid email' },
              })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                {...register('password', {
                  required: 'Password is required',
                  pattern: {
                    value: PASSWORD_RULES,
                    message: 'Password must be 8+ chars with uppercase, lowercase, number & special character',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Strength Bar */}
            {passwordValue.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${
                  strength.label === 'Weak' ? 'text-red-500' :
                  strength.label === 'Fair' ? 'text-yellow-500' :
                  strength.label === 'Good' ? 'text-blue-500' : 'text-green-500'
                }`}>{strength.label} password</p>
              </div>
            )}

            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}

            {/* Password Rules Hint */}
            <ul className="mt-2 space-y-1">
              {[
                { rule: /.{8,}/, label: 'At least 8 characters' },
                { rule: /[A-Z]/, label: 'One uppercase letter' },
                { rule: /[a-z]/, label: 'One lowercase letter' },
                { rule: /\d/, label: 'One number' },
                { rule: /[!@#$%^&*]/, label: 'One special character (!@#$%^&*)' },
              ].map(({ rule, label }) => (
                <li key={label} className={`text-xs flex items-center gap-1 ${rule.test(passwordValue) ? 'text-green-600' : 'text-gray-400'}`}>
                  {rule.test(passwordValue) ? '✅' : '○'} {label}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? <Spinner /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;