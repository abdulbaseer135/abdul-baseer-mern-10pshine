import api from './api';

export const getProfileService = async () => {
  const res = await api.get('/users/profile');
  return res.data.data; // ✅ { name, email, _id, profileImage, isEmailVerified, createdAt, ... }
};

export const updateProfileService = async (data) => {
  const res = await api.put('/users/profile', data);
  return res.data.data; // ✅ { name, email, _id, ... }
};

export const deleteProfileService = async () => {
  const res = await api.delete('/users/profile');
  return res.data; // ✅ no user object needed on delete
};

export const changePasswordService = async (data) => {
  const res = await api.put('/users/change-password', data);
  return res.data; // ✅ no user object needed on password change
};

// ✅ NEW: Upload profile image
export const uploadProfileImageService = async (formData) => {
  const res = await api.post('/profile/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data;
};

// ✅ NEW: Remove profile image
export const removeProfileImageService = async () => {
  const res = await api.delete('/profile/remove-image');
  return res.data.data;
};
