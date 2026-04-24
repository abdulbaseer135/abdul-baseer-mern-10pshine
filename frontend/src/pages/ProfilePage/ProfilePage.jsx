import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Modal from '../../components/common/Modal/Modal';
import Navbar from '../../components/common/Navbar/Navbar';
import { ROUTES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading, handleFetchProfile, handleUpdateProfile, handleChangePassword, handleDeleteAccount, handleLogout } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [deleteModal, setDeleteModal] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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

  const newPassword = watch('newPassword');

  useEffect(() => {
    handleFetchProfile();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (user) {
      resetProfile({ name: user.name, email: user.email });
    }
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'Loading...'}</h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            {user?.createdAt && (
              <p className="text-gray-400 text-xs">Member since {formatDate(user.createdAt)}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {['profile', 'password', 'danger'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'danger' ? '⚠️ Danger Zone' : tab === 'password' ? '🔒 Password' : '👤 Profile'}
            </button>
          ))}
        </div>

        {/* Tab: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>
            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    profileErrors.name ? 'border-red-400' : 'border-gray-300'
                  }`}
                  {...registerProfile('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                />
                {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                  {...registerProfile('email')}
                />
                <p className="text-gray-400 text-xs mt-1">Email cannot be changed</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.DASHBOARD)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Back to Dashboard
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab: Password */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                ✅ Password changed successfully!
              </div>
            )}

            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    passwordErrors.oldPassword ? 'border-red-400' : 'border-gray-300'
                  }`}
                  {...registerPassword('oldPassword', { required: 'Current password is required' })}
                />
                {passwordErrors.oldPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.oldPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    passwordErrors.newPassword ? 'border-red-400' : 'border-gray-300'
                  }`}
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />
                {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    passwordErrors.confirmPassword ? 'border-red-400' : 'border-gray-300'
                  }`}
                  {...registerPassword('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === newPassword || 'Passwords do not match',
                  })}
                />
                {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab: Danger Zone */}
        {activeTab === 'danger' && (
          <div className="bg-white rounded-xl border border-red-200 p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-gray-500 text-sm mb-6">
              These actions are irreversible. Please proceed with caution.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { handleLogout(); }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
              >
                🚪 Logout
              </button>
              <button
                onClick={() => setDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                🗑️ Delete Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
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

export default ProfilePage;