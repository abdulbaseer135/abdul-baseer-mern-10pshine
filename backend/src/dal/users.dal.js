const User = require('../models/User.model');

const findByEmail = async (email) => {
  return await User.findOne({ email }).select('+password');
};

const findById = async (id) => {
  return await User.findById(id);
};

const createUser = async (userData) => {
  return await User.create(userData);
};

const updateUser = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

module.exports = { findByEmail, findById, createUser, updateUser };