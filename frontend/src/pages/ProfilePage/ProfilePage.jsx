import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Modal from '../../components/common/Modal/Modal';
import Navbar from '../../components/common/Navbar/Navbar';
import { ROUTES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';


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

// ✅ TABS removed from here — moved inside component below


// ═══════════════════════════════════════════════════════
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading, handleFetchProfile, handleUpdateProfile,
          handleChangePassword, handleDeleteAccount, handleLogout } = useAuth();

  const [activeTab,           setActiveTab]          = useState('profile');
  const [deleteModal,         setDeleteModal]        = useState(false);
  const [passwordSuccess,     setPasswordSuccess]    = useState(false);
  const [showOldPassword,     setShowOldPassword]    = useState(false);
  const [showNewPassword,     setShowNewPassword]    = useState(false);
  const [showConfirmPassword, setShowConfirmPassword]= useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm();

  const newPassword = watch('newPassword', '');
  const strength    = getPasswordStrength(newPassword);

  // ✅ TABS here — UserIcon, LockIcon, AlertIcon are all in scope now
  const TABS = [
    { key: 'profile',  label: 'Profile',     icon: <UserIcon />  },
    { key: 'password', label: 'Password',    icon: <LockIcon />  },
    { key: 'danger',   label: 'Danger Zone', icon: <AlertIcon /> },
  ];

  useEffect(() => { handleFetchProfile(); }, []); // eslint-disable-line
  useEffect(() => {
    if (user) resetProfile({ name: user.name, email: user.email });
  }, [user, resetProfile]);

  const onUpdateProfile = async (data) => {
    await handleUpdateProfile({ name: data.name });
  };

  const onChangePassword = async (data) => {
    const success = await handleChangePassword({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
    if (success) {
      setPasswordSuccess(true);
      resetPassword();
      setTimeout(() => setPasswordSuccess(false), 4000);
    }
  };

  const onDeleteAccount = async () => {
    await handleDeleteAccount();
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-200">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* ─── Profile Header Card ─────────────────────── */}
        <div className="
          bg-white dark:bg-[#141414]
          border border-gray-200/60 dark:border-white/[0.07]
          rounded-2xl p-6 mb-6
          shadow-sm dark:shadow-none
          flex items-center gap-5
        ">
          <div className="
            w-16 h-16 rounded-2xl p-[2.5px] shrink-0
            bg-gradient-to-br from-indigo-500 to-blue-500
            shadow-lg shadow-indigo-500/25
          ">
            <div className="
              w-full h-full rounded-[13px]
              bg-white dark:bg-[#1a1a1a]
              flex items-center justify-center
              text-2xl font-bold
              text-indigo-600 dark:text-indigo-400
            ">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate text-gray-900 dark:text-white">
              {user?.name || 'Loading...'}
            </h1>
            <p className="text-sm truncate text-gray-500 dark:text-gray-500 mt-0.5">
              {user?.email}
            </p>
            {user?.createdAt && (
              <p className="text-xs mt-1 text-gray-400 dark:text-gray-700">
                Member since {formatDate(user.createdAt)}
              </p>
            )}
          </div>
        </div>

        {/* ─── Tabs ────────────────────────────────────── */}
        <div className="
          flex gap-1 p-1 mb-6
          bg-gray-100 dark:bg-white/[0.04]
          border border-gray-200 dark:border-white/[0.06]
          rounded-xl
        ">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
                flex-1 flex items-center justify-center gap-2
                px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === key
                  ? key === 'danger'
                    ? 'bg-white dark:bg-[#1e1e1e] text-red-600 dark:text-red-400 shadow-sm dark:shadow-none border border-red-100 dark:border-red-500/[0.15]'
                    : 'bg-white dark:bg-[#1e1e1e] text-indigo-600 dark:text-indigo-400 shadow-sm dark:shadow-none border border-gray-200 dark:border-white/[0.08]'
                  : 'text-gray-500 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-400'
                }
              `}
            >
              <span className={`
                ${activeTab === key
                  ? key === 'danger' ? 'text-red-500 dark:text-red-400' : 'text-indigo-500 dark:text-indigo-400'
                  : 'text-gray-400 dark:text-gray-600'
                }
              `}>
                {icon}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ═══ TAB: PROFILE ═══════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="
            bg-white dark:bg-[#141414]
            border border-gray-200/60 dark:border-white/[0.07]
            rounded-2xl p-6 shadow-sm dark:shadow-none
          ">
            <h2 className="text-sm font-semibold uppercase tracking-wider
              text-gray-400 dark:text-gray-600 mb-5">
              Edit Profile
            </h2>

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider
                  text-gray-400 dark:text-gray-600">
                  Full Name
                </label>
                <input
                  type="text"
                  className={inputClass(profileErrors.name)}
                  {...registerProfile('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' },
                  })}
                />
                {profileErrors.name && (
                  <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                    <ErrorIcon size={11} /> {profileErrors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider
                  text-gray-400 dark:text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  className="
                    w-full px-4 py-2.5 rounded-xl text-sm
                    bg-gray-100 dark:bg-white/[0.02]
                    border border-gray-200 dark:border-white/[0.05]
                    text-gray-400 dark:text-gray-700
                    cursor-not-allowed
                  "
                  {...registerProfile('email')}
                />
                <p className="text-xs text-gray-400 dark:text-gray-700">
                  Email address cannot be changed
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.DASHBOARD)}
                  className="
                    flex items-center gap-1.5 text-sm
                    text-gray-500 dark:text-gray-600
                    hover:text-gray-900 dark:hover:text-gray-300
                    transition-colors duration-200
                  "
                >
                  <BackIcon /> Back to Dashboard
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    px-5 py-2 rounded-xl text-sm font-semibold
                    bg-indigo-600 hover:bg-indigo-500
                    text-white shadow-lg shadow-indigo-500/25
                    disabled:opacity-40 disabled:cursor-not-allowed
                    flex items-center gap-2
                    transition-all duration-200
                  "
                >
                  {loading ? <><SpinnerIcon /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══ TAB: PASSWORD ══════════════════════════════ */}
        {activeTab === 'password' && (
          <div className="
            bg-white dark:bg-[#141414]
            border border-gray-200/60 dark:border-white/[0.07]
            rounded-2xl p-6 shadow-sm dark:shadow-none
          ">
            <h2 className="text-sm font-semibold uppercase tracking-wider
              text-gray-400 dark:text-gray-600 mb-5">
              Change Password
            </h2>

            {passwordSuccess && (
              <div className="
                flex items-center gap-2.5
                px-4 py-3 rounded-xl mb-5
                bg-green-50 dark:bg-green-500/[0.08]
                border border-green-200 dark:border-green-500/[0.15]
                text-green-700 dark:text-green-400 text-sm
              ">
                <CheckIcon /> Password changed successfully!
              </div>
            )}

            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              <PasswordField
                label="Current Password"
                placeholder="Enter current password"
                show={showOldPassword}
                onToggle={() => setShowOldPassword(v => !v)}
                hasError={!!passwordErrors.oldPassword}
                errorMsg={passwordErrors.oldPassword?.message}
                registration={registerPassword('oldPassword', { required: 'Current password is required' })}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider
                  text-gray-400 dark:text-gray-600">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className={`${inputClass(!!passwordErrors.newPassword)} pr-11`}
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      pattern: { value: PASSWORD_RULES, message: 'Does not meet all requirements below' },
                    })}
                  />
                  <EyeToggle show={showNewPassword} onToggle={() => setShowNewPassword(v => !v)} />
                </div>

                {newPassword.length > 0 && (
                  <div className="mt-1">
                    <div className="flex gap-1 mb-1.5">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className={`
                          h-1 flex-1 rounded-full transition-all duration-300
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

                {passwordErrors.newPassword && (
                  <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                    <ErrorIcon size={11} /> {passwordErrors.newPassword.message}
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
                    const passed = rule.test(newPassword);
                    return (
                      <li key={label} className={`flex items-center gap-1.5 text-xs transition-colors duration-200
                        ${passed ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>
                        {passed ? <CheckIcon /> : <DotIcon />}
                        {label}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <PasswordField
                label="Confirm New Password"
                placeholder="Confirm new password"
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(v => !v)}
                hasError={!!passwordErrors.confirmPassword}
                errorMsg={passwordErrors.confirmPassword?.message}
                registration={registerPassword('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === newPassword || 'Passwords do not match',
                })}
              />

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    px-5 py-2 rounded-xl text-sm font-semibold
                    bg-indigo-600 hover:bg-indigo-500
                    text-white shadow-lg shadow-indigo-500/25
                    disabled:opacity-40 disabled:cursor-not-allowed
                    flex items-center gap-2
                    transition-all duration-200
                  "
                >
                  {loading ? <><SpinnerIcon /> Updating...</> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══ TAB: DANGER ZONE ═══════════════════════════ */}
        {activeTab === 'danger' && (
          <div className="
            bg-white dark:bg-[#141414]
            border border-red-200/70 dark:border-red-500/[0.12]
            rounded-2xl p-6 shadow-sm dark:shadow-none
          ">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="
                w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                bg-red-50 dark:bg-red-500/[0.1]
                border border-red-100 dark:border-red-500/[0.15]
              ">
                <AlertIcon color="text-red-500 dark:text-red-400" />
              </div>
              <h2 className="text-sm font-semibold uppercase tracking-wider
                text-red-600 dark:text-red-500">
                Danger Zone
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-600 mb-6 ml-[42px]">
              These actions are permanent and cannot be undone.
            </p>

            <div className="space-y-3">
              <div className="
                flex items-center justify-between
                px-4 py-3.5 rounded-xl
                border border-gray-200 dark:border-white/[0.06]
                bg-gray-50 dark:bg-white/[0.02]
              ">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sign out</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                    Log out of your account on this device
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="
                    px-4 py-2 rounded-xl text-sm font-medium shrink-0
                    border border-gray-200 dark:border-white/[0.08]
                    text-gray-600 dark:text-gray-400
                    hover:bg-gray-100 dark:hover:bg-white/[0.06]
                    hover:text-gray-900 dark:hover:text-gray-200
                    transition-all duration-200
                  "
                >
                  Sign out
                </button>
              </div>

              <div className="
                flex items-center justify-between
                px-4 py-3.5 rounded-xl
                border border-red-100 dark:border-red-500/[0.1]
                bg-red-50/50 dark:bg-red-500/[0.04]
              ">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Delete account</p>
                  <p className="text-xs text-red-400 dark:text-red-600 mt-0.5">
                    Permanently delete your account and all notes
                  </p>
                </div>
                <button
                  onClick={() => setDeleteModal(true)}
                  className="
                    px-4 py-2 rounded-xl text-sm font-semibold shrink-0
                    bg-red-500 hover:bg-red-400
                    dark:bg-red-600 dark:hover:bg-red-500
                    text-white shadow-lg shadow-red-500/25
                    hover:-translate-y-px transition-all duration-200
                  "
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={onDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? All your notes will be lost. This action cannot be undone."
        confirmText="Delete Account"
        cancelText="Keep Account"
        confirmStyle="danger"
      />
    </div>
  );
};


/* ─── Sub-components ─────────────────────────────────── */

const PasswordField = ({ label, placeholder, show, onToggle, hasError, errorMsg, registration }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider
      text-gray-400 dark:text-gray-600">
      {label}
    </label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className={`${inputClass(hasError)} pr-11`}
        {...registration}
      />
      <EyeToggle show={show} onToggle={onToggle} />
    </div>
    {hasError && errorMsg && (
      <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
        <ErrorIcon size={11} /> {errorMsg}
      </p>
    )}
  </div>
);

const EyeToggle = ({ show, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={show ? 'Hide password' : 'Show password'}
    className="
      absolute right-3 top-1/2 -translate-y-1/2
      text-gray-400 dark:text-gray-600
      hover:text-gray-700 dark:hover:text-gray-300
      transition-colors duration-200
    "
  >
    {show ? <EyeOffIcon /> : <EyeIcon />}
  </button>
);


/* ─── Icons ──────────────────────────────────────────── */

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );
}

function AlertIcon({ color = 'text-red-500' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={color}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9"  x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
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
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
    <circle cx="12" cy="12" r="4"/>
  </svg>
);

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


export default ProfilePage;