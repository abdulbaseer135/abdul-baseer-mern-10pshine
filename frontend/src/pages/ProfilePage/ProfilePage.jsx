import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../../hooks/useAuth';
import useProfileImage from '../../hooks/useProfileImage';
import Modal from '../../components/common/Modal/Modal';
import Navbar from '../../components/common/Navbar/Navbar';
import { formatDate } from '../../utils/helpers';
import ProfileAvatarSection from './ProfileAvatarSection';
import ProfileFormTab from './ProfileFormTab';
import ChangePasswordTab from './ChangePasswordTab';
import DangerZoneTab from './DangerZoneTab';


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

const VALID_IMAGE_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'image/bmp', 'image/tiff', 'image/x-tiff', 'image/heic', 'image/heif',
  'image/x-icon', 'image/vnd.microsoft.icon', 'image/avif', 'image/jp2',
]);

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


// ═══════════════════════════════════════════════════════
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading, handleFetchProfile, handleUpdateProfile,
          handleChangePassword, handleDeleteAccount } = useAuth();

  const [activeTab,           setActiveTab]          = useState('profile');
  const [deleteModal,         setDeleteModal]        = useState(false);
  const [passwordSuccess,     setPasswordSuccess]    = useState(false);
  const [showOldPassword,     setShowOldPassword]    = useState(false);
  const [showNewPassword,     setShowNewPassword]    = useState(false);
  const [showConfirmPassword, setShowConfirmPassword]= useState(false);

  const profileImage = useProfileImage(handleFetchProfile);

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

  const TABS = [
    { key: 'profile',  label: 'Profile',     icon: <UserIcon />  },
    { key: 'password', label: 'Password',    icon: <LockIcon />  },
    { key: 'danger',   label: 'Danger Zone', icon: <AlertIcon /> },
  ];

  // Sonar: extract nested ternary for tab button styles
  const getTabButtonClassName = (key) => {
    if (activeTab !== key) {
      return 'text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/30 border border-transparent';
    }
    if (key === 'danger') {
      return 'bg-white dark:bg-slate-700/80 text-red-700 dark:text-red-300 shadow-sm dark:shadow-none border border-red-200/60 dark:border-red-700/40';
    }
    return 'bg-white dark:bg-slate-700/80 text-indigo-700 dark:text-indigo-300 shadow-sm dark:shadow-none border border-indigo-200/60 dark:border-indigo-700/40';
  };

  const getTabIconClassName = (key) => {
    if (activeTab !== key) {
      return 'text-slate-500 dark:text-slate-500';
    }
    if (key === 'danger') {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-indigo-600 dark:text-indigo-400';
  };

  useEffect(() => { handleFetchProfile(); }, []);
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

  // ✅ Profile image upload handler
  const handleImageUpload = profileImage.handleImageUpload;

  // ✅ Profile image remove handler - Show confirmation modal
  const handleRemoveImage = () => {
    profileImage.profileImage.setRemoveImageModal(true);
  };

  // ✅ Confirm and remove profile image
  const confirmRemoveImage = profileImage.confirmRemoveImage;

  return (
    <div className="h-dvh flex flex-col bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-200 overflow-hidden">
      <Navbar />

      <main className="flex-1 min-h-0 overflow-y-auto admin-scroll">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-5 md:px-6 py-4 sm:py-5 md:py-6">

          {/* ─── Back to Dashboard Button ──────────────────────── */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="
              flex items-center gap-2 mb-5
              px-3 py-1.5 rounded-md text-sm font-medium
              text-indigo-600 dark:text-indigo-400
              hover:bg-indigo-50 dark:hover:bg-slate-800
              transition-all duration-150
            "
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </button>

          {/* ╔═══════════════════════════════════════════════╗ */}
          {/* ║      PREMIUM PROFILE HERO SECTION            ║ */}
          {/* ║      (Refined & Industry-Quality)            ║ */}
          {/* ╚═══════════════════════════════════════════════╝ */}

          <div className="
            bg-white dark:bg-slate-800/90
            border border-slate-200 dark:border-slate-700/60
            rounded-2xl overflow-hidden shadow-sm dark:shadow-xl dark:shadow-black/30
            mb-5
          ">
            {/* ─── Premium Hero Container ────────────────────────────── */}
            <div className="
              relative px-5 sm:px-8 py-10 sm:py-12 
              flex flex-col items-center
              bg-gradient-to-b from-white via-white to-slate-50/50
              dark:from-slate-800 dark:via-slate-800 dark:to-slate-750
            ">

              {/* ─── Avatar + Actions Block (Circular Avatar with Icon Actions) ────────── */}
            <ProfileAvatarSection
              user={user}
              profileImage={profileImage}
              handleRemoveImage={handleRemoveImage}
              fileInputRef={profileImage.fileInputRef}
              handleImageUpload={handleImageUpload}
            />

              {/* ─── Profile Name (Primary Visual Element) ──────────── */}
              <h1 className="
                text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white
                text-center mb-2 tracking-tight
              ">
                {user?.name || 'Loading...'}
              </h1>

              {/* ─── Email (Secondary, Quieter) ──────────────────────── */}
              <p className="
                text-slate-500 dark:text-slate-400 text-sm mb-6
                text-center font-medium
              ">
                {user?.email}
              </p>

              {/* ─── Metadata Chips (Better Aligned & Polished) ──────── */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 flex-wrap">
                {user?.createdAt && (
                  <div className="
                    flex items-center gap-2 
                    text-xs sm:text-sm text-slate-600 dark:text-slate-300
                    px-3.5 py-2 
                    rounded-lg
                    bg-slate-50 dark:bg-slate-700/40
                    border border-slate-200 dark:border-slate-600/30
                    transition-all duration-150
                  ">
                    <CalendarIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <span className="font-medium">Member since {formatDate(user.createdAt)}</span>
                  </div>
                )}

                {user?.isEmailVerified && (
                  <div className="
                    flex items-center gap-2 
                    text-xs sm:text-sm text-green-700 dark:text-green-200
                    px-3.5 py-2 
                    rounded-lg
                    bg-green-50 dark:bg-green-950/30
                    border border-green-200 dark:border-green-800/40
                    transition-all duration-150
                  ">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="font-medium">Email Verified</span>
                  </div>
                )}
              </div>

              {/* ─── Helper Text (Subtle) ──────────────────────────── */}
              <p className="
                text-center text-xs text-slate-400 dark:text-slate-500 
                mt-6 z-10 font-medium tracking-wide
              ">
                Recommended: 400×400 pixels • Any format • Max 5MB
              </p>

              {/* ─── Error Message Toast ────────────────────────────────────── */}
              {profileImage.imageError && (
                <div className="
                  mt-6 w-full z-10 max-w-2xl
                  flex items-start gap-3 px-5 py-4 rounded-xl
                  bg-red-50 dark:bg-red-950/40
                  border border-red-200 dark:border-red-800/60
                  text-red-700 dark:text-red-200 text-sm font-medium
                  shadow-lg dark:shadow-xl dark:shadow-red-950/30
                  backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300
                ">
                  <ErrorIcon className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-300" />
                  <span className="text-red-800 dark:text-red-100">{profileImage.imageError}</span>
                </div>
              )}

              {/* ─── Success Message Toast ──────────────────────────────────── */}
              {profileImage.imageSuccess && (
                <div className="
                  mt-6 w-full z-10 max-w-2xl
                  flex items-start gap-3 px-5 py-4 rounded-xl
                  bg-green-50 dark:bg-green-950/40
                  border border-green-200 dark:border-green-800/60
                  text-green-700 dark:text-green-200 text-sm font-medium
                  shadow-lg dark:shadow-xl dark:shadow-green-950/30
                  backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300
                ">
                  <CheckIcon className="w-5 h-5 shrink-0 mt-0.5 text-green-600 dark:text-green-300" />
                  <span className="text-green-800 dark:text-green-100">Image updated successfully! ✨</span>
                </div>
              )}
            </div>
          </div>

          {/* ╔═══════════════════════════════════════════════╗ */}
          {/* ║      TABS SECTION (Profile/Password/Delete)  ║ */}
          {/* ╚═══════════════════════════════════════════════╝ */}

          {/* ─── Tabs (Tighter Integration with Hero) ────────────────── */}
          <div className="
            flex gap-1.5 p-1.5 mb-6
            bg-white dark:bg-slate-800/80
            border border-slate-200 dark:border-slate-700/60
            rounded-xl backdrop-blur-xs shadow-xs
          ">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 relative ${getTabButtonClassName(key)}`}
              >
                <span className={`text-sm sm:text-base flex items-center justify-center ${getTabIconClassName(key)}`}>
                  {icon}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* ═══ TAB: PROFILE ═══════════════════════════════ */}
          {activeTab === 'profile' && (
            <ProfileFormTab
              user={user}
              loading={loading}
              profileErrors={profileErrors}
              handleSubmit={handleProfileSubmit}
              onUpdateProfile={onUpdateProfile}
              register={registerProfile}
            />
          )}

          {/* ═══ TAB: PASSWORD ═════════════════════════════ */}
          {activeTab === 'password' && (
            <ChangePasswordTab
              passwordSuccess={passwordSuccess}
              loading={loading}
              passwordErrors={passwordErrors}
              handleSubmit={handlePasswordSubmit}
              onChangePassword={onChangePassword}
              register={registerPassword}
              watch={watch}
              showOldPassword={showOldPassword}
              setShowOldPassword={setShowOldPassword}
              showNewPassword={showNewPassword}
              setShowNewPassword={setShowNewPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              strength={strength}
              strengthTextColor={strengthTextColor}
              newPassword={newPassword}
            />
          )}

          {/* ═══ TAB: DANGER ZONE ══════════════════════════ */}
          {activeTab === 'danger' && (
            <DangerZoneTab setDeleteModal={setDeleteModal} />
          )}

        </div>
      </main>

      {/* ═══ Delete Confirmation Modal ════════════════════ */}
      <Modal 
        isOpen={deleteModal} 
        title="Delete Account?" 
        onClose={() => setDeleteModal(false)}
        onConfirm={onDeleteAccount}
        confirmStyle="danger"
        confirmText="Delete My Account"
      >
        <div className="space-y-4">
          <div className="
            p-3 rounded-lg border-l-4 border-l-red-600
            bg-red-50 dark:bg-red-950/20
            border border-red-200 dark:border-red-800/50
          ">
            <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
              ⚠️ This action cannot be undone
            </p>
            <p className="text-xs text-red-800 dark:text-red-300">
              Deleting your account will permanently remove all your data, notes, and settings. There is no way to recover this information after deletion.
            </p>
          </div>

          <div className="space-y-3 py-2">
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <p className="font-semibold mb-2">What will happen:</p>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex gap-2">
                  <span className="text-red-600 dark:text-red-400">•</span>
                  <span>All your notes will be deleted permanently</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 dark:text-red-400">•</span>
                  <span>Your profile and settings will be removed</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 dark:text-red-400">•</span>
                  <span>Shared notes with other users will become unavailable</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 dark:text-red-400">•</span>
                  <span>Your email will be released and can be reused</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>

      {/* ═══ Remove Profile Image Confirmation Modal ════════════════════ */}
      {profileImage.removeImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="
            bg-white dark:bg-slate-800
            rounded-2xl shadow-2xl dark:shadow-2xl dark:shadow-black/50
            max-w-sm w-full p-6 sm:p-8
            border border-slate-200 dark:border-slate-700
            transform transition-all duration-300 scale-100 opacity-100
            animate-in fade-in zoom-in-95
          ">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="
                w-12 h-12 rounded-full
                bg-red-100 dark:bg-red-950/40
                flex items-center justify-center
              ">
                <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
            </div>

            {/* Title */}
            <h2 className="
              text-xl sm:text-2xl font-bold text-center
              text-slate-900 dark:text-white mb-2
              tracking-tight
            ">
              Remove Profile Picture?
            </h2>

            {/* Subtitle */}
            <p className="
              text-center text-slate-600 dark:text-slate-400
              text-sm mb-6
            ">
              Your profile will show your initials instead. You can upload a new photo anytime.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => profileImage.setRemoveImageModal(false)}
                disabled={profileImage.imageLoading}
                className="
                  flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold
                  bg-slate-100 dark:bg-slate-700/60
                  text-slate-700 dark:text-slate-200
                  hover:bg-slate-200 dark:hover:bg-slate-700
                  transition-all duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-slate-400/30
                "
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveImage}
                disabled={profileImage.imageLoading}
                className="
                  flex-1 flex items-center justify-center gap-2
                  px-4 py-2.5 rounded-lg text-sm font-semibold
                  bg-red-600 hover:bg-red-700 active:bg-red-800
                  dark:bg-red-600 dark:hover:bg-red-700
                  text-white
                  shadow-md hover:shadow-lg dark:shadow-black/30
                  transition-all duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-red-400/30
                "
              >
                {profileImage.imageLoading ? (
                  <>
                    <SpinnerIcon className="w-4 h-4 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    <span>Remove</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ─── ICONS ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// Sonar: add PropTypes for className
const CameraIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
CameraIcon.propTypes = {
  className: PropTypes.string,
};

// Sonar: add PropTypes for className
const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);
TrashIcon.propTypes = {
  className: PropTypes.string,
};

// Sonar: add PropTypes for className
const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
CalendarIcon.propTypes = {
  className: PropTypes.string,
};

// Sonar: add PropTypes for className
const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
CheckCircleIcon.propTypes = {
  className: PropTypes.string,
};

// Sonar: add className prop and PropTypes for CheckIcon
const CheckIcon = ({ className }) => (
  <svg className={className} width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
CheckIcon.propTypes = {
  className: PropTypes.string,
};

// Sonar: add PropTypes for size
const ErrorIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
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

const DotIcon = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// Sonar: add PropTypes for className
const SpinnerIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
  </svg>
);
SpinnerIcon.propTypes = {
  className: PropTypes.string,
};

// Sonar: add PropTypes for className
const ArrowLeftIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);
ArrowLeftIcon.propTypes = {
  className: PropTypes.string,
};

export default ProfilePage;

