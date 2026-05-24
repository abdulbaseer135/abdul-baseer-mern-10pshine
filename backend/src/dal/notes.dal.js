const Note = require('../models/Note.model');

const createNote = async (noteData) => {
  return await Note.create(noteData);
};

const getNotesByUser = async (userId, page = 1, limit = 10, search = '') => {
  const skip = (page - 1) * limit;

  const query = {
    userId,
    ...(search && {
      title: { $regex: search, $options: 'i' },
    }),
  };

  const notes = await Note.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Note.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    notes,
    total,
    page,
    limit,
    totalPages,
  };
};

const getNoteById = async (id) => {
  return await Note.findById(id);
};

const updateNote = async (id, updateData) => {
  return await Note.findByIdAndUpdate(id, updateData, {
    returnDocument: 'after',
    runValidators: true,
  });
};

const deleteNote = async (id) => {
  return await Note.findByIdAndDelete(id);
};

const getNoteByShareToken = async (token) => {
  return await Note.findOne({
    shareToken: token,
    isPublic: true,
  }).populate('userId', 'name');
};

const getNoteByNoteId = async (noteId, userId) => {
  return await Note.findOne({ noteId, userId });
};

module.exports = {
  createNote,
  getNotesByUser,
  getNoteById,
  updateNote,
  deleteNote,
  getNoteByShareToken,
  getNoteByNoteId,
};