import api from './api';

export const signupService = async (data) => {
  const res = await api.post('/auth/signup', data);
  return res.data.data; // ✅ unwrap { token, user }
};

export const loginService = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data.data; // ✅ unwrap { token, user }
};

export const logoutService = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};