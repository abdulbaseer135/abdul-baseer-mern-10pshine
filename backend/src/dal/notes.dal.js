const Note = require('../models/Note.model');

const createNote = async (noteData) => {
  return await Note.create(noteData);
};

const getNotesByUser = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const notes = await Note.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await Note.countDocuments({ userId });
  return { notes, total, page, limit };
};

const getNoteById = async (id) => {
  return await Note.findById(id);
};

const updateNote = async (id, updateData) => {
  return await Note.findByIdAndUpdate(
    id,
    updateData,
    { returnDocument: 'after', runValidators: true }
  );
};

const deleteNote = async (id) => {
  return await Note.findByIdAndDelete(id);
};

module.exports = { createNote, getNotesByUser, getNoteById, updateNote, deleteNote };