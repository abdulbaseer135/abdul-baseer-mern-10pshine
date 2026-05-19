import api from './api';

// ─── Auth ──────────────────────────────────────────────────────────────
export const signupService = async (data) => {
  const res = await api.post('/auth/signup', data);
  return res.data.data; // ✅ { token, user }
};

export const loginService = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data.data; // ✅ { token, user }
};

export const logoutService = async () => {
  await api.post('/auth/logout');
  // ✅ Redux handles cleanup — no localStorage here
};

// ─── Profile ───────────────────────────────────────────────────────────
export const getProfileService = async () => {
  const res = await api.get('/users/profile');
  return res.data.data; // ✅ { user }
};

export const updateProfileService = async (data) => {
  const res = await api.put('/users/profile', data);
  return res.data.data; // ✅ { user }
};

export const deleteAccountService = async () => {
  await api.delete('/users/profile');
  // ✅ Redux + localStorage cleanup handled by caller
};

export const changePasswordService = async (data) => {
  // ✅ /users/change-password is whitelisted in api.js interceptor
  // so wrong current password → error toast, NOT logout redirect
  const res = await api.put('/users/change-password', data);
  return res.data;
};

// ─── OTP & Password Reset ──────────────────────────────────────────────
// ✅ NEW: Send OTP email
export const sendOTPService = async (email, purpose) => {
  const res = await api.post('/auth/send-otp', { email, purpose });
  return res.data;
};

// ✅ NEW: Verify OTP code
export const verifyOTPService = async (email, otp, purpose) => {
  const res = await api.post('/auth/verify-otp', { email, otp, purpose });
  return res.data;
};

// ✅ NEW: Reset password with new password
export const resetPasswordService = async (email, newPassword) => {
  const res = await api.post('/auth/reset-password', { email, newPassword });
  return res.data;
};
