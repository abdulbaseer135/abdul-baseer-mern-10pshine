import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  login,
  register,
  fetchProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  logout,
  clearError,
} from '../store/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (credentials) => {
    const result = await dispatch(login(credentials));
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back!');
      return true;
    } else {
      toast.error('Something went wrong. Try again.');
      return false;
    }
  };

  const handleRegister = async (userData) => {
    const result = await dispatch(register(userData));
    if (register.fulfilled.match(result)) {
      toast.success('Account created successfully!');
      return true;
    } else {
      toast.error('Something went wrong. Try again.');
      return false;
    }
  };

  const handleFetchProfile = async () => {
    const result = await dispatch(fetchProfile());
    if (fetchProfile.rejected.match(result)) {
      toast.error('Something went wrong. Try again.');
    }
  };

  const handleUpdateProfile = async (data) => {
    const result = await dispatch(updateProfile(data));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Something went wrong. Try again.');
    }
  };

  const handleChangePassword = async (data) => {
    const result = await dispatch(changePassword(data));
    if (changePassword.fulfilled.match(result)) {
      toast.success('Password changed successfully!');
      return true;
    } else {
      toast.error('Something went wrong. Try again.');
      return false;
    }
  };

  const handleDeleteAccount = async () => {
    const result = await dispatch(deleteAccount());
    if (deleteAccount.fulfilled.match(result)) {
      toast.success('Account deleted');
      return true;
    } else {
      toast.error('Something went wrong. Try again.');
      return false;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClearError = () => dispatch(clearError());

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    handleLogin,
    handleRegister,
    handleFetchProfile,
    handleUpdateProfile,
    handleChangePassword,
    handleDeleteAccount,
    handleLogout,
    handleClearError,
  };
};

export default useAuth;