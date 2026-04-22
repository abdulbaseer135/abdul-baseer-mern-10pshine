const User = require('../models/User.model');

const createUser = async (userData) => {
  return await User.create(userData);
};

const findByEmail = async (email) => {
  return await User.findOne({ email });
};

const findById = async (id) => {
  return await User.findById(id).select('-password').lean();
};

const updateUser = async (id, updateData) => {
  return await User.findByIdAndUpdate(
    id,
    updateData,
    { returnDocument: 'after', runValidators: true }
  ).select('-password').lean();
};

const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

module.exports = { createUser, findByEmail, findById, updateUser, deleteUser };