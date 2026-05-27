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
    try {
      await dispatch(login(credentials)).unwrap();
      toast.success('Welcome back!');
      return true;
    } catch (err) {
      console.error(err); // Sonar: handle caught exception
      toast.error('Something went wrong. Try again.');
      return false;
    }
  };

  const handleRegister = async (userData) => {
    try {
      await dispatch(register(userData)).unwrap();
      toast.success('Account created successfully!');
      return true;
    } catch (err) {
      console.error(err); // Sonar: handle caught exception
      toast.error('Something went wrong. Try again.');
      return false;
    }
  };

  const handleFetchProfile = async () => {
    try {
      await dispatch(fetchProfile()).unwrap();
    } catch (err) {
      console.error(err); // Sonar: handle caught exception
      toast.error('Something went wrong. Try again.');
    }
  };

  const handleUpdateProfile = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err); // Sonar: handle caught exception
      toast.error('Something went wrong. Try again.');
    }
  };

  const handleChangePassword = async (data) => {
    try {
      await dispatch(changePassword(data)).unwrap();
      toast.success('Password changed successfully!');
      return true;
    } catch (err) {
      console.error(err); // Sonar: handle caught exception
      toast.error('Something went wrong. Try again.');
      return false;
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteAccount()).unwrap();
      toast.success('Account deleted');
      return true;
    } catch (err) {
      console.error(err); // Sonar: handle caught exception
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