import api from './api';

export const getProfileService = async () => {
  const res = await api.get('/users/profile');
  return res.data;
};

export const updateProfileService = async (data) => {
  const res = await api.put('/users/profile', data);
  return res.data;
};

export const deleteProfileService = async () => {
  const res = await api.delete('/users/profile');
  return res.data;
};