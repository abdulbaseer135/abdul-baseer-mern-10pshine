import PropTypes from 'prop-types';
import PasswordField from './PasswordField';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import PasswordRequirements from './PasswordRequirements';

// ✅ Constants
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const EYE_ICON_SIZE = 16;

// ✅ Button styling (extracted constant)
const EYE_BUTTON_STYLE = {
  padding: 0,
  margin: 0,
  border: 'none',
  background: 'transparent',
  lineHeight: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden'
};

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const EyeIcon = ({ size = EYE_ICON_SIZE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = ({ size = EYE_ICON_SIZE }) => (
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

const ChangePasswordTab = ({
  passwordSuccess,
  loading,
  passwordErrors,
  handleSubmit,
  onChangePassword,
  register,
  watch,
  showOldPassword,
  setShowOldPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  strength,
  strengthTextColor,
  newPassword
}) => {
  // ✅ Safe form submission with error handling
  const handleFormSubmit = async (data) => {
    try {
      if (!data.oldPassword?.trim()) {
        console.warn('[ChangePasswordTab] Form submitted with empty old password');
        return;
      }
      
      if (!data.newPassword?.trim()) {
        console.warn('[ChangePasswordTab] Form submitted with empty new password');
        return;
      }
      
      await onChangePassword(data);
    } catch (err) {
      // Sonar: handle caught exception - log and let parent handle
      console.error('[ChangePasswordTab] Password change failed:', {
        error: err?.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
  <div className="
    bg-white dark:bg-slate-800
    border border-slate-200 dark:border-slate-700
    rounded-lg p-6 sm:p-8 shadow-sm dark:shadow-lg dark:shadow-black/20
  ">
    <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700/50">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
        Change Password
      </h2>
      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
        Update your password to keep your account secure
      </p>
    </div>

    {passwordSuccess && (
      <div className="
        flex items-center gap-2.5
        px-4 py-3 rounded-md mb-5
        bg-green-50 dark:bg-green-900/25
        border border-green-200 dark:border-green-700/60
        text-green-700 dark:text-green-200 text-sm font-medium
      ">
        <CheckIcon /> Password updated successfully!
      </div>
    )}

    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5">
      <div className="flex flex-col gap-1.5">
        <PasswordField
          id="profile-old-password"
          label="Current Password"
          placeholder="••••••••"
          isVisible={showOldPassword}
          onToggleVisibility={() => setShowOldPassword(!showOldPassword)}
          error={passwordErrors.oldPassword}
          {...register('oldPassword', { required: 'Current password is required' })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="profile-new-password" className="text-xs font-semibold text-slate-900 dark:text-white">
          New Password
        </label>
        <div className="relative group">
          <input
            id="profile-new-password"
            type={showNewPassword ? 'text' : 'password'}
            placeholder="••••••••"
            aria-label="New password input"
            aria-invalid={!!passwordErrors.newPassword}
            className={`
              w-full px-3 py-2.5 pr-10 rounded-md text-sm
              bg-white dark:bg-slate-700/40
              text-slate-900 dark:text-white
              placeholder-slate-400 dark:placeholder-slate-500
              border transition-all duration-150
              focus:outline-none
              ${passwordErrors.newPassword
                ? 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-600/20'
                : 'border-slate-300 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20'
              }
            `}
            {...register('newPassword', {
              required: 'New password is required',
              pattern: {
                value: PASSWORD_REGEX,
                message: 'Does not meet requirements',
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-150"
            style={EYE_BUTTON_STYLE}
            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            title={showNewPassword ? 'Hide password' : 'Show password'}
          >
            {showNewPassword ? <EyeOffIcon size={EYE_ICON_SIZE} /> : <EyeIcon size={EYE_ICON_SIZE} />}
          </button>
        </div>
        {passwordErrors.newPassword && (
          <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-300 font-medium" role="alert">
            <span>•</span> {passwordErrors.newPassword.message}
          </p>
        )}

        <PasswordStrengthIndicator password={newPassword} strength={strength} strengthTextColor={strengthTextColor} />
        <PasswordRequirements password={newPassword} />
      </div>

      <div className="flex flex-col gap-1.5">
        <PasswordField
          id="profile-confirm-password"
          label="Confirm Password"
          placeholder="••••••••"
          isVisible={showConfirmPassword}
          onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
          error={passwordErrors.confirmPassword}
          {...register('confirmPassword', {
            required: 'Please confirm password',
            validate: (val) => val === newPassword || 'Passwords do not match',
          })}
        />
      </div>

      <button
        type="submit"
        className="
          w-full py-2.5 px-4 rounded-md text-sm font-semibold
          bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
          dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:active:bg-indigo-700
          text-white shadow-sm dark:shadow-md dark:shadow-indigo-900/20
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150 mt-5 group
        "
        disabled={loading}
        aria-busy={loading}
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Update Password Securely</span>
            </>
          )}
        </span>
      </button>
    </form>
  </div>
  );
};

ChangePasswordTab.propTypes = {
  passwordSuccess: PropTypes.bool,
  loading: PropTypes.bool,
  passwordErrors: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  watch: PropTypes.func,
  showOldPassword: PropTypes.bool,
  setShowOldPassword: PropTypes.func.isRequired,
  showNewPassword: PropTypes.bool,
  setShowNewPassword: PropTypes.func.isRequired,
  showConfirmPassword: PropTypes.bool,
  setShowConfirmPassword: PropTypes.func.isRequired,
  strength: PropTypes.shape({
    score: PropTypes.number,
    label: PropTypes.string,
    color: PropTypes.string,
  }),
  strengthTextColor: PropTypes.object,
  newPassword: PropTypes.string,
};

export default ChangePasswordTab;
