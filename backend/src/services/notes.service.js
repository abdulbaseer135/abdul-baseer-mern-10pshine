const {
  createNote,
  getNotesByUser,
  getNoteById,
  updateNote,
  deleteNote,
} = require('../dal/notes.dal');
const ApiError = require('../utils/ApiError');

const create = async (userId, { title, content }) => {
  return await createNote({ title, content, userId });
};

const getAll = async (userId, page, limit) => {
  return await getNotesByUser(userId, page, limit);
};

const getOne = async (noteId, userId) => {
  const note = await getNoteById(noteId);
  if (!note) throw new ApiError(404, 'Note not found');
  if (note.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to access this note');
  }
  return note;
};

const update = async (noteId, userId, updateData) => {
  const note = await getNoteById(noteId);
  if (!note) throw new ApiError(404, 'Note not found');
  if (note.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to update this note');
  }
  return await updateNote(noteId, updateData);
};

const remove = async (noteId, userId) => {
  const note = await getNoteById(noteId);
  if (!note) throw new ApiError(404, 'Note not found');
  if (note.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to delete this note');
  }
  return await deleteNote(noteId);
};

module.exports = { create, getAll, getOne, update, remove };