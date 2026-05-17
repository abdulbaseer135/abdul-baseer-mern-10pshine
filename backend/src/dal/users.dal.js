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

// ═════════════════════════════════════════════════════════════════════
// ✅ CASCADE DELETE: Must use document instance to trigger middleware
// Do NOT use findByIdAndDelete() alone as it bypasses pre-hooks
// ═════════════════════════════════════════════════════════════════════
const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    return null;
  }
  // Use document.deleteOne() to trigger pre-delete middleware
  // This ensures all user's notes are deleted before user is deleted
  await user.deleteOne();
  return user;
};

module.exports = { createUser, findByEmail, findById, updateUser, deleteUser };