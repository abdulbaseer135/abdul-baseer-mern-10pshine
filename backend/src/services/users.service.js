const { findById, updateUser, deleteUser } = require('../dal/users.dal');
const ApiError = require('../utils/ApiError');

const getProfile = async (userId) => {
  const user = await findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const updateProfile = async (userId, updateData) => {
  // prevent password update through this route
  delete updateData.password;
  delete updateData.email;

  const user = await updateUser(userId, updateData);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const deleteProfile = async (userId) => {
  const user = await deleteUser(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

module.exports = { getProfile, updateProfile, deleteProfile };