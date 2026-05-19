import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Modal from '../../components/common/Modal/Modal';
import Navbar from '../../components/common/Navbar/Navbar';
import { ROUTES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import { uploadProfileImageService, removeProfileImageService } from '../../services/profile.service';


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
  const [imageLoading,        setImageLoading]       = useState(false);
  const [imageError,          setImageError]         = useState(null);
  const [imageSuccess,        setImageSuccess]       = useState(false);
  const fileInputRef = useRef(null);

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
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please upload JPEG, PNG, or WebP format only');
      return;
    }

    setImageLoading(true);
    setImageError(null);
    setImageSuccess(false);

    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      await uploadProfileImageService(formData);
      await handleFetchProfile();
      setImageSuccess(true);
      setTimeout(() => setImageSuccess(false), 3000);
    } catch (err) {
      setImageError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ✅ Profile image remove handler
  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile image?')) return;

    setImageLoading(true);
    setImageError(null);

    try {
      await removeProfileImageService();
      await handleFetchProfile();
      setImageSuccess(true);
      setTimeout(() => setImageSuccess(false), 3000);
    } catch (err) {
      setImageError(err.response?.data?.message || 'Failed to remove image');
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-200 overflow-hidden">
      <Navbar />

      <main className="flex-1 min-h-0 overflow-y-auto admin-scroll">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">

          {/* ─── Back to Dashboard Button ──────────────────────── */}
          <button
            onClick={() => navigate('/dashboard')}
            className="
              flex items-center gap-2 mb-6
              px-4 py-2 rounded-lg text-sm font-medium
              text-indigo-600 dark:text-indigo-400
              hover:bg-indigo-50 dark:hover:bg-indigo-500/[0.1]
              transition-colors duration-200
            "
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </button>

          {/* ╔═══════════════════════════════════════════════╗ */}
          {/* ║        PROFESSIONAL IMAGE SECTION            ║ */}
          {/* ║        (Like Facebook/Instagram)             ║ */}
          {/* ╚═══════════════════════════════════════════════╝ */}

          <div className="
            bg-gradient-to-b from-indigo-500/10 to-transparent
            dark:from-indigo-500/5 dark:to-transparent
            border border-gray-200 dark:border-white/[0.07]
            rounded-2xl overflow-hidden shadow-sm dark:shadow-none
            mb-8
          ">
            {/* ─── Image Container ────────────────────────────────────── */}
            <div className="relative px-6 sm:px-8 py-12 sm:py-16 flex flex-col items-center">

              {/* Background gradient decoration */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl"></div>
              </div>

              {/* ✅ Profile Image Display */}
            {/* ✅ Profile Image Display with Buttons */}
            <div className="relative z-10 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 justify-center">
              
              {/* Image Container */}
              <div>
                {user?.profileImage ? (
                  <div className="group relative">
                    <img
                      src={user.profileImage}
                      alt={user?.name}
                      className="
                        w-24 h-24 sm:w-32 sm:h-32 rounded-2xl
                        object-cover shadow-2xl shadow-indigo-500/25
                        ring-4 ring-white dark:ring-[#0a0a0a]
                      "
                      onError={(e) => {
                        console.error('Image failed to load:', user.profileImage);
                      }}
                    />
                    {/* Edit overlay on hover */}
                    <div className="
                      absolute inset-0 rounded-2xl
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-200
                      bg-black/50 flex items-center justify-center
                      cursor-pointer
                    "
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <CameraIcon className="w-6 h-6 text-white mx-auto mb-1" />
                        <p className="text-white text-xs font-semibold">Change</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="
                    w-24 h-24 sm:w-32 sm:h-32 rounded-2xl p-1
                    bg-gradient-to-br from-indigo-500 to-blue-500
                    shadow-2xl shadow-indigo-500/25
                    ring-4 ring-white dark:ring-[#0a0a0a]
                  ">
                    <div className="
                      w-full h-full rounded-[15px]
                      bg-white dark:bg-[#0a0a0a]
                      flex items-center justify-center
                    ">
                      <span className="text-4xl sm:text-5xl font-bold
                        text-indigo-600 dark:text-indigo-400">
                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons - Next to Image */}
              <div className="flex gap-2 flex-col">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageLoading}
                  className="
                    flex items-center gap-2 px-4 py-2.5
                    text-sm font-semibold text-white
                    bg-indigo-600 hover:bg-indigo-500
                    dark:bg-indigo-600 dark:hover:bg-indigo-500
                    rounded-lg transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-lg shadow-indigo-500/25
                    whitespace-nowrap
                  "
                >
                  {imageLoading ? (
                    <>
                      <SpinnerIcon className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CameraIcon className="w-4 h-4" />
                      {user?.profileImage ? 'Change' : 'Upload'}
                    </>
                  )}
                </button>

                {user?.profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={imageLoading}
                    className="
                      flex items-center gap-2 px-4 py-2.5
                      text-sm font-semibold
                      text-red-600 dark:text-red-400
                      bg-red-50 dark:bg-red-500/[0.08]
                      hover:bg-red-100 dark:hover:bg-red-500/[0.15]
                      border border-red-200 dark:border-red-500/[0.15]
                      rounded-lg transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      whitespace-nowrap
                    "
                  >
                    <TrashIcon className="w-4 h-4" />
                    Remove
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={imageLoading}
                  className="hidden"
                />
              </div>
            </div>

              {/* ─── Profile Info ─────────────────────────── */}
              <div className="text-center z-10 mb-8 max-w-2xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {user?.name || 'Loading...'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {user?.email}
                </p>

                {/* Member info & Email verified */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                  {user?.createdAt && (
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                      <CalendarIcon className="w-4 h-4" />
                      Member since {formatDate(user.createdAt)}
                    </div>
                  )}

                  {user?.isEmailVerified && (
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-green-600 dark:text-green-400 
                      bg-green-50 dark:bg-green-500/[0.08] px-3 py-1.5 rounded-full
                      border border-green-200 dark:border-green-500/[0.15]">
                      <CheckCircleIcon className="w-4 h-4" />
                      Email Verified
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Info Text ───────────────────────────── */}
              <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-600 mt-4 z-10">
                Recommended size: 400×400 pixels • JPEG, PNG, or WebP
              </p>

              {/* ─── Error Message ────────────────────────────────────── */}
              {imageError && (
                <div className="
                  mt-6 w-full z-10
                  flex items-start gap-3 px-4 py-3 rounded-xl
                  bg-red-50 dark:bg-red-500/[0.08]
                  border border-red-200 dark:border-red-500/[0.15]
                  text-red-600 dark:text-red-400 text-sm
                ">
                  <ErrorIcon className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{imageError}</span>
                </div>
              )}

              {/* ─── Success Message ──────────────────────────────────── */}
              {imageSuccess && (
                <div className="
                  mt-6 w-full z-10
                  flex items-start gap-3 px-4 py-3 rounded-xl
                  bg-green-50 dark:bg-green-500/[0.08]
                  border border-green-200 dark:border-green-500/[0.15]
                  text-green-600 dark:text-green-400 text-sm
                ">
                  <CheckIcon className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Image updated successfully!</span>
                </div>
              )}
            </div>
          </div>

          {/* ╔═══════════════════════════════════════════════╗ */}
          {/* ║      TABS SECTION (Profile/Password/Delete)  ║ */}
          {/* ╚═══════════════════════════════════════════════╝ */}

          {/* ─── Tabs ────────────────────────────────────── */}
          <div className="
            flex gap-1 p-1 mb-6 sm:mb-8
            bg-gray-100 dark:bg-white/[0.04]
            border border-gray-200 dark:border-white/[0.06]
            rounded-lg sm:rounded-xl
          ">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`
                  flex-1 flex items-center justify-center gap-1 sm:gap-2
                  px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium
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
                  text-xs sm:text-sm flex items-center justify-center
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
              rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-none
            ">
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider
                text-gray-600 dark:text-gray-200 mb-4 sm:mb-5">
                Edit Profile
              </h2>

              <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider
                    text-gray-600 dark:text-gray-200">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
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

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider
                    text-gray-600 dark:text-gray-200">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    className="
                      w-full px-4 py-2.5 rounded-xl text-sm
                      bg-gray-100 dark:bg-white/[0.02]
                      text-gray-500 dark:text-gray-600
                      border border-gray-200 dark:border-white/[0.08]
                      cursor-not-allowed
                    "
                    value={user?.email || ''}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-600">
                    Email address cannot be changed
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="
                    w-full py-2.5 px-4 rounded-xl text-sm font-semibold
                    bg-indigo-600 hover:bg-indigo-500
                    text-white shadow-lg shadow-indigo-500/25
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200 mt-2
                  "
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* ═══ TAB: PASSWORD ═════════════════════════════ */}
          {activeTab === 'password' && (
            <div className="
              bg-white dark:bg-[#141414]
              border border-gray-200/60 dark:border-white/[0.07]
              rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-none
            ">
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider
                text-gray-600 dark:text-gray-200 mb-4 sm:mb-5">
                Change Password
              </h2>

              {passwordSuccess && (
                <div className="
                  flex items-start gap-2.5
                  px-4 py-3 rounded-xl mb-4
                  bg-green-50 dark:bg-green-500/[0.08]
                  border border-green-200 dark:border-green-500/[0.15]
                  text-green-600 dark:text-green-400 text-sm
                ">
                  <CheckIcon /> Password updated successfully!
                </div>
              )}

              <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
                {/* Old Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider
                    text-gray-600 dark:text-gray-200">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`${inputClass(passwordErrors.oldPassword)} pr-11`}
                      {...registerPassword('oldPassword', { required: 'Current password is required' })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      {showOldPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {passwordErrors.oldPassword && (
                    <p className="text-xs text-red-500 dark:text-red-400">{passwordErrors.oldPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider
                    text-gray-600 dark:text-gray-200">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`${inputClass(passwordErrors.newPassword)} pr-11`}
                      {...registerPassword('newPassword', {
                        required: 'New password is required',
                        pattern: {
                          value: PASSWORD_RULES,
                          message: 'Does not meet requirements',
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>

                  {newPassword.length > 0 && (
                    <div className="mt-1">
                      <div className="flex gap-1 mb-1.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`
                              h-1 flex-1 rounded-full transition-all duration-300
                              ${i <= strength.score
                                ? strength.color
                                : 'bg-gray-200 dark:bg-white/[0.07]'
                              }
                            `}
                          />
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
                    <p className="text-xs text-red-500 dark:text-red-400">{passwordErrors.newPassword.message}</p>
                  )}

                  <ul className="mt-2 space-y-1">
                    {[
                      { rule: /.{8,}/, label: '8+ characters' },
                      { rule: /[A-Z]/, label: 'Uppercase' },
                      { rule: /[a-z]/, label: 'Lowercase' },
                      { rule: /\d/, label: 'Number' },
                      { rule: /[!@#$%^&*]/, label: 'Special char' },
                    ].map(({ rule, label }) => (
                      <li key={label}
                        className={`flex items-center gap-1.5 text-xs transition-colors duration-200
                          ${rule.test(newPassword)
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-400 dark:text-gray-600'
                          }`}>
                        {rule.test(newPassword) ? <CheckIcon /> : <DotIcon />}
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider
                    text-gray-600 dark:text-gray-200">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`${inputClass(passwordErrors.confirmPassword)} pr-11`}
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm password',
                        validate: (val) => val === newPassword || 'Passwords do not match',
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-red-500 dark:text-red-400">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="
                    w-full py-2.5 px-4 rounded-xl text-sm font-semibold
                    bg-indigo-600 hover:bg-indigo-500
                    text-white shadow-lg shadow-indigo-500/25
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200 mt-2
                  "
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* ═══ TAB: DANGER ZONE ══════════════════════════ */}
          {activeTab === 'danger' && (
            <div className="
              bg-white dark:bg-[#141414]
              border border-red-200/50 dark:border-red-500/[0.15]
              rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-none
            ">
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider
                text-red-600 dark:text-red-400 mb-4 sm:mb-5">
                Danger Zone
              </h2>

              <div className="space-y-4">
                <div className="
                  p-4 rounded-xl
                  bg-red-50 dark:bg-red-500/[0.08]
                  border border-red-200 dark:border-red-500/[0.15]
                ">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Deleting your account is permanent and cannot be undone. All your notes and data will be permanently deleted.
                  </p>
                  <button
                    type="button"
                    onClick={() => setDeleteModal(true)}
                    className="
                      px-4 py-2.5 rounded-xl text-sm font-semibold
                      bg-red-600 hover:bg-red-500
                      text-white transition-all duration-200
                    "
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ═══ Delete Confirmation Modal ════════════════════ */}
      <Modal isOpen={deleteModal} title="Delete Account?" onClose={() => setDeleteModal(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you absolutely sure? This action cannot be undone. All your notes will be permanently deleted.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setDeleteModal(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium
                bg-gray-100 dark:bg-white/[0.08] text-gray-700 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-white/[0.12] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { setDeleteModal(false); onDeleteAccount(); }}
              className="px-4 py-2 rounded-lg text-sm font-medium
                bg-red-600 hover:bg-red-500 text-white transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </Modal>
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

const CameraIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ErrorIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
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

const DotIcon = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const SpinnerIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
  </svg>
);

const ArrowLeftIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

export default ProfilePage;
